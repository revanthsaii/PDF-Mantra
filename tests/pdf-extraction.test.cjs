const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { PDFDocument, PDFName } = require('pdf-lib');

// Keep native file-system/sharing calls at the boundary; exercise the real
// service and pdf-lib against serialized PDF documents in memory.
function createService() {
    const files = new Map();
    const fileSystem = {
        documentDirectory: 'file:///documents/',
        EncodingType: { Base64: 'base64' },
        readAsStringAsync: async (uri) => {
            assert.ok(files.has(uri), `Missing fixture: ${uri}`);
            return files.get(uri);
        },
        writeAsStringAsync: async (uri, contents) => files.set(uri, contents),
    };
    const filename = path.join(__dirname, '../modules/pdf/PDFService.ts');
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(compiled, {
        exports,
        console,
        require: (name) => {
            if (name === 'expo-file-system/legacy') return fileSystem;
            if (name === 'expo-sharing') return {};
            return require(name);
        },
    }, { filename });
    return { service: exports.pdfService, files };
}

async function textFixture(content) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    page.node.set(PDFName.of('Contents'), pdf.context.register(pdf.context.flateStream(content)));
    return pdf.saveAsBase64();
}

test('text arrays retain literal and hex strings adjacent to spacing numbers', async () => {
    const { service, files } = createService();
    files.set('input.pdf', await textFixture('BT [(Hello)-200(World)0<21>] TJ ET'));
    assert.equal(await service.extractText('input.pdf'), '--- Page 1 ---\nHello World!\n\n');
});

test('text arrays retain strings with whitespace around spacing numbers', async () => {
    const { service, files } = createService();
    files.set('input.pdf', await textFixture('BT [(Hello) -200 (World) 0 <21>] TJ ET'));
    assert.equal(await service.extractText('input.pdf'), '--- Page 1 ---\nHello World!\n\n');
});

for (const filterKind of ['direct', 'array', 'wrapped', 'indirect']) {
    test(`JPEG extraction preserves bytes with ${filterKind} filters`, async () => {
        const { service, files } = createService();
        const pdf = await PDFDocument.create();
        pdf.addPage();
        // The service must export compressed image bytes without JPEG decoding.
        const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x02, 0xff, 0xd9]);
        const props = { Type: 'XObject', Subtype: 'Image', Width: 1, Height: 1,
            ColorSpace: 'DeviceRGB', BitsPerComponent: 8 };
        let stream;
        if (filterKind === 'wrapped') {
            stream = pdf.context.flateStream(jpeg, props);
            stream.dict.set(PDFName.of('Filter'), pdf.context.obj(['FlateDecode', 'DCTDecode']));
        } else {
            stream = pdf.context.stream(jpeg, props);
            const filter = filterKind === 'array'
                ? pdf.context.obj(['DCTDecode']) : PDFName.of('DCTDecode');
            stream.dict.set(PDFName.of('Filter'), filterKind === 'indirect'
                ? pdf.context.register(filter) : filter);
        }
        pdf.context.register(stream);
        files.set('input.pdf', await pdf.saveAsBase64());
        const uris = await service.extractImages('input.pdf');
        assert.equal(uris.length, 1);
        assert.deepEqual(Buffer.from(files.get(uris[0]), 'base64'), Buffer.from(jpeg));
    });
}

test('non-JPEG images and empty filters are skipped', async () => {
    const { service, files } = createService();
    const pdf = await PDFDocument.create();
    pdf.addPage();
    for (const filter of [[], ['FlateDecode']]) {
        pdf.context.register(pdf.context.stream(new Uint8Array(), {
            Subtype: 'Image', Filter: filter,
        }));
    }
    files.set('input.pdf', await pdf.saveAsBase64());
    assert.equal((await service.extractImages('input.pdf')).length, 0);
});
