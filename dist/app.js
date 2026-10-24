import * as THREE from './vendor/three/build/three.module.js';
import { OrbitControls } from './vendor/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from './vendor/three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './vendor/three/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from './vendor/three/examples/jsm/loaders/FBXLoader.js';
import * as pipeline from './pipeline-core.mjs';

const localeMeta = {
  en: { flag: '🇬🇧', name: 'English' },
  es: { flag: '🇪🇸', name: 'Español' },
  ja: { flag: '🇯🇵', name: '日本語' },
  zh: { flag: '🇨🇳', name: '中文' },
  pt: { flag: '🇵🇹', name: 'Português' },
  ru: { flag: '🇷🇺', name: 'Русский' },
};

const sampleAssets = [
  { source: './assets/examples/pixelart-crystal-skull.png', name: 'pixelart-crystal-skull.png' },
  { source: './assets/examples/pixelart-harbor-village.png', name: 'pixelart-harbor-village.png' },
  { source: './assets/examples/pixelart-volcano-forge.png', name: 'pixelart-volcano-forge.png' },
];
let lastSampleIndex = -1;

const locales = {
  en: {
    brandHome: 'Pixel Forge home', localOnly: 'local only', importImage: 'Import image', exportPng: 'Export PNG',
    eyebrow: 'Image → indexed pixel art', heroTitleLine1: 'Forge your image', heroTitleLine2: 'one pixel at a time.',
    heroCopy: 'Place an image, frame it in the grid, and let the pipeline find its pixelated version.',
    browserOnly: 'Everything happens in your browser.', nothingUploaded: 'Nothing is uploaded.', documentSettings: 'Document settings',
    canvas: 'Canvas', resolution: 'Resolution', resolutionPresets: 'Resolution presets', readyToImport: 'Ready to import',
    pixelEditor: 'Pixel art editor', sourceImage: 'Source image', sourceZoom: 'Source canvas zoom', resultZoom: 'Result zoom',
    view: 'View', zoomOut: 'Zoom out', zoomIn: 'Zoom in', fit: 'Fit', center: 'Center', sourceCanvas: 'Source image canvas',
    dropImageHere: 'Drop an image here', orPaste: 'or paste it from the clipboard', chooseFile: 'Choose file', loadExample: 'Load example',
    noImageLoaded: 'No image loaded', moveScaleHint: 'Drag to move · corner to scale', pixelArtResult: 'Pixel art result',
    resultCanvas: 'Pixel art result canvas', waitingForImage: 'Waiting for image', resultAppearsHere: 'Your result will appear here',
    importToStart: 'Import an image to start the forge.', onePixelPerCell: 'The grid shows one pixel per cell', sourceTreatment: 'Source treatment',
    nonDestructive: 'Non-destructive', removeBackground: 'Remove background', removeBackgroundHelp: 'Flood fill from the image edges',
    addBorder: 'Add border', addBorderHelp: 'Draw outside visible pixels', borderColor: 'Border color', borderWidth: 'Border width',
    tuneForge: 'Tune the forge', livePreview: 'Live preview', generate: 'Generate', indexedPalette: 'Indexed palette',
    colors: '{value} colors', oklabAccent: 'OKLab · preserves accents', contrast: 'Contrast', soft: 'Soft', luminanceCurve: 'Luminance curve',
    bold: 'Bold', edgeStrength: 'Edge strength', clean: 'Clean', sobelEdgePass: 'Sobel edge pass', ink: 'Ink',
    pipelineOrder: 'Order: source treatment → palette → contrast → edges → cell majority. The original image is never modified.',
    builtLocally: 'Built locally for images worth keeping.', noValidImage: 'Choose a valid image file.', dropImage: 'Drop an image file.',
    imageReadError: 'That image could not be read.', sourceReady: 'Image ready to forge', workerFallback: 'Worker unavailable · using local mode',
    processing: 'Processing pipeline…', forgeProgress: 'Forge in progress', forgeReady: 'Forge ready', regenerating: 'Regenerating…',
    exported: 'Exported as pixelart-{value}x{value}.png', generated: 'Generated · {value} ms', waiting: 'Waiting for image',
    removeBackgroundAria: 'Remove background', addBorderAria: 'Add border', languageButton: 'Change language',
  },
  es: {
    brandHome: 'Inicio de Pixel Forge', localOnly: 'solo local', importImage: 'Importar imagen', exportPng: 'Exportar PNG',
    eyebrow: 'Imagen → pixel art indexado', heroTitleLine1: 'Forja tu imagen', heroTitleLine2: 'píxel a píxel.',
    heroCopy: 'Coloca una imagen, encuádrela en la grilla y deja que el pipeline encuentre su versión pixelada.',
    browserOnly: 'Todo ocurre en tu navegador.', nothingUploaded: 'Nada se sube.', documentSettings: 'Configuración del documento',
    canvas: 'Lienzo', resolution: 'Resolución', resolutionPresets: 'Preajustes de resolución', readyToImport: 'Listo para importar',
    pixelEditor: 'Editor de pixel art', sourceImage: 'Imagen original', sourceZoom: 'Zoom del lienzo fuente', resultZoom: 'Zoom del resultado',
    view: 'Vista', zoomOut: 'Alejar vista', zoomIn: 'Acercar vista', fit: 'Encajar', center: 'Centrar', sourceCanvas: 'Lienzo de imagen original',
    dropImageHere: 'Arrastra una imagen aquí', orPaste: 'o pégala desde el portapapeles', chooseFile: 'Elegir archivo', loadExample: 'Cargar ejemplo',
    noImageLoaded: 'Sin imagen cargada', moveScaleHint: 'Arrastra para mover · esquina para escalar', pixelArtResult: 'Resultado pixel art',
    resultCanvas: 'Lienzo de resultado pixel art', waitingForImage: 'Esperando imagen', resultAppearsHere: 'Tu resultado aparecerá aquí',
    importToStart: 'Importa una imagen para comenzar el forge.', onePixelPerCell: 'La grilla muestra un píxel por celda', sourceTreatment: 'Tratamiento de fuente',
    nonDestructive: 'No destructivo', removeBackground: 'Eliminar fondo', removeBackgroundHelp: 'Relleno desde los bordes de la imagen',
    addBorder: 'Agregar borde', addBorderHelp: 'Dibuja fuera de los píxeles visibles', borderColor: 'Color del borde', borderWidth: 'Ancho del borde',
    tuneForge: 'Ajusta el forge', livePreview: 'Vista previa en vivo', generate: 'Generar', indexedPalette: 'Paleta indexada',
    colors: '{value} colores', oklabAccent: 'OKLab · conserva acentos', contrast: 'Contraste', soft: 'Suave', luminanceCurve: 'Curva de luminancia',
    bold: 'Intenso', edgeStrength: 'Refuerzo de bordes', clean: 'Limpio', sobelEdgePass: 'Paso de bordes Sobel', ink: 'Tinta',
    pipelineOrder: 'Orden: tratamiento de fuente → paleta → contraste → bordes → mayoría por celda. La imagen original nunca se modifica.',
    builtLocally: 'Creado localmente para imágenes que vale la pena conservar.', noValidImage: 'Elige un archivo de imagen válido.', dropImage: 'Suelta un archivo de imagen.',
    imageReadError: 'No se pudo leer esa imagen.', sourceReady: 'Imagen lista para forjar', workerFallback: 'Worker no disponible · usando modo local',
    processing: 'Procesando pipeline…', forgeProgress: 'Forge en progreso', forgeReady: 'Forge listo', regenerating: 'Regenerando…',
    exported: 'Exportado como pixelart-{value}x{value}.png', generated: 'Generado · {value} ms', waiting: 'Esperando imagen',
    removeBackgroundAria: 'Eliminar fondo', addBorderAria: 'Agregar borde', languageButton: 'Cambiar idioma',
  },
  ja: {
    brandHome: 'Pixel Forge ホーム', localOnly: 'ローカルのみ', importImage: '画像を読み込む', exportPng: 'PNGを書き出す',
    eyebrow: '画像 → インデックス付きピクセルアート', heroTitleLine1: '画像を鍛えて', heroTitleLine2: '一 pixel ずつ。', heroCopy: '画像を配置してグリッドに合わせ、パイプラインでピクセルアートに変換します。',
    browserOnly: 'すべてブラウザで処理します。', nothingUploaded: 'アップロードされません。', documentSettings: 'ドキュメント設定', canvas: 'キャンバス', resolution: '解像度', resolutionPresets: '解像度プリセット', readyToImport: '読み込み準備完了', pixelEditor: 'ピクセルアートエディター', sourceImage: '元画像', sourceZoom: '元画像キャンバスのズーム', resultZoom: '結果のズーム', view: '表示', zoomOut: 'ズームアウト', zoomIn: 'ズームイン', fit: 'フィット', center: '中央', sourceCanvas: '元画像キャンバス', dropImageHere: 'ここに画像をドロップ', orPaste: 'またはクリップボードから貼り付け', chooseFile: 'ファイルを選択', loadExample: 'サンプルを読み込む', noImageLoaded: '画像がありません', moveScaleHint: 'ドラッグで移動 · 角で拡大縮小', pixelArtResult: 'ピクセルアート結果', resultCanvas: 'ピクセルアート結果キャンバス', waitingForImage: '画像を待っています', resultAppearsHere: 'ここに結果が表示されます', importToStart: '画像を読み込んで開始します。', onePixelPerCell: '1セルに1ピクセルを表示', sourceTreatment: '元画像の処理', nonDestructive: '非破壊', removeBackground: '背景を削除', removeBackgroundHelp: '画像の端から塗りつぶし', addBorder: '境界線を追加', addBorderHelp: '表示ピクセルの外側に描画', borderColor: '境界線の色', borderWidth: '境界線の幅', tuneForge: 'Forgeを調整', livePreview: 'ライブプレビュー', generate: '生成', indexedPalette: 'インデックスパレット', colors: '{value}色', oklabAccent: 'OKLab · アクセントを保持', contrast: 'コントラスト', soft: 'ソフト', luminanceCurve: '輝度カーブ', bold: '強調', edgeStrength: 'エッジ強度', clean: 'クリーン', sobelEdgePass: 'Sobelエッジ', ink: 'インク', pipelineOrder: '順序: 元画像処理 → パレット → コントラスト → エッジ → セルの多数色。元画像は変更されません。', builtLocally: '大切な画像のためにローカルで動作します。', noValidImage: '有効な画像ファイルを選択してください。', dropImage: '画像ファイルをドロップしてください。', imageReadError: '画像を読み込めませんでした。', sourceReady: '画像の準備ができました', workerFallback: 'Workerが利用できません · ローカル処理を使用', processing: '処理中…', forgeProgress: '生成中', forgeReady: '生成完了', regenerating: '再生成中…', exported: 'pixelart-{value}x{value}.png として書き出しました', generated: '生成完了 · {value} ms', waiting: '画像を待っています', removeBackgroundAria: '背景を削除', addBorderAria: '境界線を追加', languageButton: '言語を変更',
  },
  zh: {
    brandHome: 'Pixel Forge 首页', localOnly: '仅本地', importImage: '导入图片', exportPng: '导出 PNG', eyebrow: '图片 → 索引像素画', heroTitleLine1: '锻造你的图片', heroTitleLine2: '一像素一像素。', heroCopy: '放置图片、调整网格，让处理管线生成像素化版本。', browserOnly: '所有处理都在浏览器中完成。', nothingUploaded: '不会上传任何内容。', documentSettings: '文档设置', canvas: '画布', resolution: '分辨率', resolutionPresets: '分辨率预设', readyToImport: '准备导入', pixelEditor: '像素画编辑器', sourceImage: '原始图片', sourceZoom: '原图画布缩放', resultZoom: '结果缩放', view: '视图', zoomOut: '缩小', zoomIn: '放大', fit: '适应', center: '居中', sourceCanvas: '原图画布', dropImageHere: '将图片拖到这里', orPaste: '或从剪贴板粘贴', chooseFile: '选择文件', loadExample: '加载示例', noImageLoaded: '未加载图片', moveScaleHint: '拖动移动 · 拖拽角落缩放', pixelArtResult: '像素画结果', resultCanvas: '像素画结果画布', waitingForImage: '等待图片', resultAppearsHere: '结果将在此显示', importToStart: '导入图片开始锻造。', onePixelPerCell: '每个单元格显示一个像素', sourceTreatment: '原图处理', nonDestructive: '非破坏性', removeBackground: '移除背景', removeBackgroundHelp: '从图片边缘进行泛洪填充', addBorder: '添加边框', addBorderHelp: '在可见像素外绘制', borderColor: '边框颜色', borderWidth: '边框宽度', tuneForge: '调整 Forge', livePreview: '实时预览', generate: '生成', indexedPalette: '索引调色板', colors: '{value} 色', oklabAccent: 'OKLab · 保留强调色', contrast: '对比度', soft: '柔和', luminanceCurve: '亮度曲线', bold: '强烈', edgeStrength: '边缘强度', clean: '干净', sobelEdgePass: 'Sobel 边缘', ink: '墨线', pipelineOrder: '顺序：原图处理 → 调色板 → 对比度 → 边缘 → 单元格主色。原图不会被修改。', builtLocally: '为值得保存的图片在本地构建。', noValidImage: '请选择有效的图片文件。', dropImage: '请放入图片文件。', imageReadError: '无法读取该图片。', sourceReady: '图片已准备好', workerFallback: 'Worker不可用 · 使用本地模式', processing: '正在处理…', forgeProgress: '正在生成', forgeReady: '生成完成', regenerating: '正在重新生成…', exported: '已导出为 pixelart-{value}x{value}.png', generated: '已生成 · {value} ms', waiting: '等待图片', removeBackgroundAria: '移除背景', addBorderAria: '添加边框', languageButton: '更改语言',
  },
  pt: {
    brandHome: 'Início do Pixel Forge', localOnly: 'somente local', importImage: 'Importar imagem', exportPng: 'Exportar PNG', eyebrow: 'Imagem → pixel art indexado', heroTitleLine1: 'Forje sua imagem', heroTitleLine2: 'um pixel por vez.', heroCopy: 'Coloque uma imagem, enquadre-a na grade e deixe o pipeline encontrar sua versão pixelada.', browserOnly: 'Tudo acontece no seu navegador.', nothingUploaded: 'Nada é enviado.', documentSettings: 'Configurações do documento', canvas: 'Tela', resolution: 'Resolução', resolutionPresets: 'Predefinições de resolução', readyToImport: 'Pronto para importar', pixelEditor: 'Editor de pixel art', sourceImage: 'Imagem original', sourceZoom: 'Zoom da tela original', resultZoom: 'Zoom do resultado', view: 'Visualização', zoomOut: 'Afastar', zoomIn: 'Aproximar', fit: 'Ajustar', center: 'Centralizar', sourceCanvas: 'Tela da imagem original', dropImageHere: 'Arraste uma imagem aqui', orPaste: 'ou cole da área de transferência', chooseFile: 'Escolher arquivo', loadExample: 'Carregar exemplo', noImageLoaded: 'Nenhuma imagem carregada', moveScaleHint: 'Arraste para mover · canto para redimensionar', pixelArtResult: 'Resultado em pixel art', resultCanvas: 'Tela do resultado pixel art', waitingForImage: 'Aguardando imagem', resultAppearsHere: 'Seu resultado aparecerá aqui', importToStart: 'Importe uma imagem para começar.', onePixelPerCell: 'A grade mostra um pixel por célula', sourceTreatment: 'Tratamento da fonte', nonDestructive: 'Não destrutivo', removeBackground: 'Remover fundo', removeBackgroundHelp: 'Preenchimento a partir das bordas', addBorder: 'Adicionar borda', addBorderHelp: 'Desenhar fora dos pixels visíveis', borderColor: 'Cor da borda', borderWidth: 'Largura da borda', tuneForge: 'Ajuste o forge', livePreview: 'Prévia ao vivo', generate: 'Gerar', indexedPalette: 'Paleta indexada', colors: '{value} cores', oklabAccent: 'OKLab · preserva acentos', contrast: 'Contraste', soft: 'Suave', luminanceCurve: 'Curva de luminância', bold: 'Forte', edgeStrength: 'Intensidade das bordas', clean: 'Limpo', sobelEdgePass: 'Passagem de bordas Sobel', ink: 'Tinta', pipelineOrder: 'Ordem: tratamento da fonte → paleta → contraste → bordas → maioria por célula. A imagem original nunca é alterada.', builtLocally: 'Criado localmente para imagens importantes.', noValidImage: 'Escolha um arquivo de imagem válido.', dropImage: 'Solte um arquivo de imagem.', imageReadError: 'Não foi possível ler a imagem.', sourceReady: 'Imagem pronta para forjar', workerFallback: 'Worker indisponível · usando modo local', processing: 'Processando…', forgeProgress: 'Forge em andamento', forgeReady: 'Forge pronto', regenerating: 'Regenerando…', exported: 'Exportado como pixelart-{value}x{value}.png', generated: 'Gerado · {value} ms', waiting: 'Aguardando imagem', removeBackgroundAria: 'Remover fundo', addBorderAria: 'Adicionar borda', languageButton: 'Mudar idioma',
  },
  ru: {
    brandHome: 'Главная Pixel Forge', localOnly: 'только локально', importImage: 'Импортировать изображение', exportPng: 'Экспорт PNG', eyebrow: 'Изображение → индексированный пиксель-арт', heroTitleLine1: 'Создайте изображение', heroTitleLine2: 'по одному пикселю.', heroCopy: 'Поместите изображение в сетку и позвольте конвейеру создать пиксельную версию.', browserOnly: 'Всё происходит в браузере.', nothingUploaded: 'Ничего не загружается.', documentSettings: 'Настройки документа', canvas: 'Холст', resolution: 'Разрешение', resolutionPresets: 'Пресеты разрешения', readyToImport: 'Готово к импорту', pixelEditor: 'Редактор пиксель-арта', sourceImage: 'Исходное изображение', sourceZoom: 'Масштаб исходного холста', resultZoom: 'Масштаб результата', view: 'Вид', zoomOut: 'Уменьшить', zoomIn: 'Увеличить', fit: 'Вписать', center: 'По центру', sourceCanvas: 'Холст исходного изображения', dropImageHere: 'Перетащите изображение сюда', orPaste: 'или вставьте из буфера обмена', chooseFile: 'Выбрать файл', loadExample: 'Загрузить пример', noImageLoaded: 'Изображение не загружено', moveScaleHint: 'Перетаскивайте для движения · угол меняет масштаб', pixelArtResult: 'Результат пиксель-арта', resultCanvas: 'Холст результата пиксель-арта', waitingForImage: 'Ожидание изображения', resultAppearsHere: 'Результат появится здесь', importToStart: 'Импортируйте изображение, чтобы начать.', onePixelPerCell: 'Сетка показывает один пиксель в ячейке', sourceTreatment: 'Обработка исходника', nonDestructive: 'Неразрушающий режим', removeBackground: 'Удалить фон', removeBackgroundHelp: 'Заливка от краёв изображения', addBorder: 'Добавить рамку', addBorderHelp: 'Рисовать за пределами видимых пикселей', borderColor: 'Цвет рамки', borderWidth: 'Ширина рамки', tuneForge: 'Настройте forge', livePreview: 'Предпросмотр в реальном времени', generate: 'Создать', indexedPalette: 'Индексированная палитра', colors: '{value} цветов', oklabAccent: 'OKLab · сохраняет акценты', contrast: 'Контраст', soft: 'Мягкий', luminanceCurve: 'Кривая яркости', bold: 'Сильный', edgeStrength: 'Сила границ', clean: 'Чисто', sobelEdgePass: 'Проход границ Sobel', ink: 'Чернила', pipelineOrder: 'Порядок: обработка исходника → палитра → контраст → границы → большинство в ячейке. Исходное изображение не изменяется.', builtLocally: 'Создано локально для изображений, которые хочется сохранить.', noValidImage: 'Выберите корректный файл изображения.', dropImage: 'Перетащите файл изображения.', imageReadError: 'Не удалось прочитать изображение.', sourceReady: 'Изображение готово', workerFallback: 'Worker недоступен · используется локальный режим', processing: 'Обработка…', forgeProgress: 'Создание', forgeReady: 'Готово', regenerating: 'Перегенерация…', exported: 'Экспортировано как pixelart-{value}x{value}.png', generated: 'Создано · {value} мс', waiting: 'Ожидание изображения', removeBackgroundAria: 'Удалить фон', addBorderAria: 'Добавить рамку', languageButton: 'Изменить язык',
  },
};

Object.assign(locales.en, { localStudio: 'Local pixelart studio', sourceKicker: '01 / source canvas', outputKicker: '02 / generated output', treatmentKicker: '02 / source treatment', pipelineKicker: '03 / processing pipeline' });
Object.assign(locales.es, { localStudio: 'Estudio local de pixelart', sourceKicker: '01 / lienzo fuente', outputKicker: '02 / resultado generado', treatmentKicker: '02 / tratamiento de fuente', pipelineKicker: '03 / pipeline de procesamiento' });
Object.assign(locales.ja, { localStudio: 'ローカルピクセルアートスタジオ', sourceKicker: '01 / 元画像キャンバス', outputKicker: '02 / 生成結果', treatmentKicker: '02 / 元画像処理', pipelineKicker: '03 / 処理パイプライン' });
Object.assign(locales.zh, { localStudio: '本地像素画工作室', sourceKicker: '01 / 原图画布', outputKicker: '02 / 生成结果', treatmentKicker: '02 / 原图处理', pipelineKicker: '03 / 处理管线' });
Object.assign(locales.pt, { localStudio: 'Estúdio local de pixel art', sourceKicker: '01 / tela original', outputKicker: '02 / resultado gerado', treatmentKicker: '02 / tratamento da fonte', pipelineKicker: '03 / pipeline de processamento' });
Object.assign(locales.ru, { localStudio: 'Локальная студия пиксель-арта', sourceKicker: '01 / исходный холст', outputKicker: '02 / созданный результат', treatmentKicker: '02 / обработка исходника', pipelineKicker: '03 / конвейер обработки' });

const modeLabels = {
  en: { editorMode: 'Editor mode', mode2d: '2D', mode3d: '3D', modelCanvas: '3D model canvas', dropModelHere: 'Drop a 3D model here', modelFormats: 'GLB, GLTF, OBJ, FBX or MTL files', chooseModel: 'Choose model', importModel: 'Import model', noModelLoaded: 'No model loaded', orbitZoomHint: 'Drag to orbit · wheel to zoom', resetView: 'Reset view', modelSource: '3D model', modelKicker: '01 / model canvas', modelReady: 'Model ready to forge', loadingModel: 'Loading model…', modelLoadError: 'That model could not be loaded.', webglError: 'WebGL is unavailable. 2D mode is still available.', modelResultAppearsHere: 'Your 3D result will appear here', importModelToStart: 'Import a local model to start the forge.' },
  es: { editorMode: 'Modo del editor', mode2d: '2D', mode3d: '3D', modelCanvas: 'Lienzo del modelo 3D', dropModelHere: 'Arrastra un modelo 3D aquí', modelFormats: 'Archivos GLB, GLTF, OBJ, FBX o MTL', chooseModel: 'Elegir modelo', importModel: 'Importar modelo', noModelLoaded: 'Sin modelo cargado', orbitZoomHint: 'Arrastra para orbitar · rueda para zoom', resetView: 'Restablecer vista', modelSource: 'Modelo 3D', modelKicker: '01 / lienzo del modelo', modelReady: 'Modelo listo para forjar', loadingModel: 'Cargando modelo…', modelLoadError: 'No se pudo cargar ese modelo.', webglError: 'WebGL no está disponible. El modo 2D sigue disponible.', modelResultAppearsHere: 'Tu resultado 3D aparecerá aquí', importModelToStart: 'Importa un modelo local para comenzar el forge.' },
  ja: { editorMode: 'エディターモード', mode2d: '2D', mode3d: '3D', modelCanvas: '3Dモデルキャンバス', dropModelHere: '3Dモデルをここにドロップ', modelFormats: 'GLB、GLTF、OBJ、FBX、MTLファイル', chooseModel: 'モデルを選択', importModel: 'モデルを読み込む', noModelLoaded: 'モデルがありません', orbitZoomHint: 'ドラッグで回転 · ホイールでズーム', resetView: '表示をリセット', modelSource: '3Dモデル', modelKicker: '01 / モデルキャンバス', modelReady: 'モデルの準備ができました', loadingModel: 'モデルを読み込み中…', modelLoadError: 'モデルを読み込めませんでした。', webglError: 'WebGLを利用できません。2Dモードは使用できます。', modelResultAppearsHere: 'ここに3D結果が表示されます', importModelToStart: 'ローカルモデルを読み込んで開始します。' },
  zh: { editorMode: '编辑模式', mode2d: '2D', mode3d: '3D', modelCanvas: '3D 模型画布', dropModelHere: '将 3D 模型拖到这里', modelFormats: 'GLB、GLTF、OBJ、FBX 或 MTL 文件', chooseModel: '选择模型', importModel: '导入模型', noModelLoaded: '未加载模型', orbitZoomHint: '拖动旋转 · 滚轮缩放', resetView: '重置视图', modelSource: '3D 模型', modelKicker: '01 / 模型画布', modelReady: '模型已准备好', loadingModel: '正在加载模型…', modelLoadError: '无法加载该模型。', webglError: 'WebGL 不可用。仍可使用 2D 模式。', modelResultAppearsHere: '3D 结果将在此显示', importModelToStart: '导入本地模型开始锻造。' },
  pt: { editorMode: 'Modo do editor', mode2d: '2D', mode3d: '3D', modelCanvas: 'Tela do modelo 3D', dropModelHere: 'Arraste um modelo 3D aqui', modelFormats: 'Arquivos GLB, GLTF, OBJ, FBX ou MTL', chooseModel: 'Escolher modelo', importModel: 'Importar modelo', noModelLoaded: 'Nenhum modelo carregado', orbitZoomHint: 'Arraste para orbitar · roda para zoom', resetView: 'Redefinir vista', modelSource: 'Modelo 3D', modelKicker: '01 / tela do modelo', modelReady: 'Modelo pronto para forjar', loadingModel: 'Carregando modelo…', modelLoadError: 'Não foi possível carregar o modelo.', webglError: 'WebGL indisponível. O modo 2D continua disponível.', modelResultAppearsHere: 'Seu resultado 3D aparecerá aqui', importModelToStart: 'Importe um modelo local para começar.' },
  ru: { editorMode: 'Режим редактора', mode2d: '2D', mode3d: '3D', modelCanvas: 'Холст 3D-модели', dropModelHere: 'Перетащите 3D-модель сюда', modelFormats: 'Файлы GLB, GLTF, OBJ, FBX или MTL', chooseModel: 'Выбрать модель', importModel: 'Импортировать модель', noModelLoaded: 'Модель не загружена', orbitZoomHint: 'Перетаскивайте для вращения · колесо для масштаба', resetView: 'Сбросить вид', modelSource: '3D-модель', modelKicker: '01 / холст модели', modelReady: 'Модель готова', loadingModel: 'Загрузка модели…', modelLoadError: 'Не удалось загрузить модель.', webglError: 'WebGL недоступен. Режим 2D всё ещё доступен.', modelResultAppearsHere: 'Здесь появится 3D-результат', importModelToStart: 'Импортируйте локальную модель, чтобы начать.' },
};
Object.entries(modeLabels).forEach(([code, labels]) => Object.assign(locales[code], labels));

const previewLabels = {
  en: { proofKicker: '04 / output proof', proofTitle: '1:1 output preview', whiteBackground: 'White background', blackBackground: 'Black background', whitePreview: 'Output on white background', blackPreview: 'Output on black background', proofWaiting: 'Generate an image to inspect transparency.', proofReady: 'Exact output · no grid overlay' },
  es: { proofKicker: '04 / prueba de salida', proofTitle: 'Vista de salida 1:1', whiteBackground: 'Fondo blanco', blackBackground: 'Fondo negro', whitePreview: 'Salida sobre fondo blanco', blackPreview: 'Salida sobre fondo negro', proofWaiting: 'Genera una imagen para revisar la transparencia.', proofReady: 'Salida exacta · sin grilla' },
  ja: { proofKicker: '04 / 出力確認', proofTitle: '1:1 出力プレビュー', whiteBackground: '白い背景', blackBackground: '黒い背景', whitePreview: '白い背景の出力', blackPreview: '黒い背景の出力', proofWaiting: '透明度を確認するには画像を生成してください。', proofReady: '正確な出力 · グリッドなし' },
  zh: { proofKicker: '04 / 输出检查', proofTitle: '1:1 输出预览', whiteBackground: '白色背景', blackBackground: '黑色背景', whitePreview: '白色背景上的输出', blackPreview: '黑色背景上的输出', proofWaiting: '生成图片以检查透明度。', proofReady: '精确输出 · 无网格' },
  pt: { proofKicker: '04 / prova da saída', proofTitle: 'Prévia da saída 1:1', whiteBackground: 'Fundo branco', blackBackground: 'Fundo preto', whitePreview: 'Saída sobre fundo branco', blackPreview: 'Saída sobre fundo preto', proofWaiting: 'Gere uma imagem para verificar a transparência.', proofReady: 'Saída exata · sem grade' },
  ru: { proofKicker: '04 / проверка результата', proofTitle: 'Предпросмотр 1:1', whiteBackground: 'Белый фон', blackBackground: 'Чёрный фон', whitePreview: 'Результат на белом фоне', blackPreview: 'Результат на чёрном фоне', proofWaiting: 'Создайте изображение, чтобы проверить прозрачность.', proofReady: 'Точный результат · без сетки' },
};
Object.entries(previewLabels).forEach(([code, labels]) => Object.assign(locales[code], labels));

const sourceLabels = {
  en: { sourceCode: 'Source code', mcpGuide: 'MCP / agent guide', assetPrompt: 'Asset prompt' },
  es: { sourceCode: 'Código fuente', mcpGuide: 'Guía MCP / agentes', assetPrompt: 'Prompt de assets' },
  ja: { sourceCode: 'ソースコード', mcpGuide: 'MCP / エージェントガイド', assetPrompt: 'アセット用プロンプト' },
  zh: { sourceCode: '源代码', mcpGuide: 'MCP / 代理指南', assetPrompt: '素材提示词' },
  pt: { sourceCode: 'Código-fonte', mcpGuide: 'Guia MCP / agentes', assetPrompt: 'Prompt de assets' },
  ru: { sourceCode: 'Исходный код', mcpGuide: 'Руководство MCP / агенты', assetPrompt: 'Промпт для ассетов' },
};
Object.entries(sourceLabels).forEach(([code, labels]) => Object.assign(locales[code], labels));

const localeStorageKey = 'pixel-forge.locale';
let currentLocale = 'en';

function t(key, values = {}) {
  const source = locales[currentLocale] || locales.en;
  const template = source[key] || locales.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

const state = {
  mode: '2d',
  resolution: 128,
  image: null,
  sourceUrl: null,
  fileName: '',
  baseScale: 1,
  transform: { x: 64, y: 64, scale: 1 },
  viewZoom: { source: 1, result: 1 },
  pipeline: { palette: 48, contrast: 0, edges: 0, live: true },
  sourceEffects: { removeBackground: false, backgroundTolerance: 0.08, borderEnabled: false, borderWidth: 2, borderColor: '#131313' },
  locale: 'en',
  output: null,
  usedColors: null,
  lastElapsedMs: null,
  busy: false,
  requestId: 0,
  outputs: { '2d': { output: null, usedColors: null, lastElapsedMs: null }, '3d': { output: null, usedColors: null, lastElapsedMs: null } },
  model: { root: null, name: '', files: [] },
  three: { renderer: null, scene: null, camera: null, controls: null, modelRoot: null, objectUrls: [], initialized: false, error: false, initialCamera: null },
};

const els = {
  fileInput: document.querySelector('#file-input'),
  mode2d: document.querySelector('#mode-2d'),
  mode3d: document.querySelector('#mode-3d'),
  importButton: document.querySelector('#import-button'),
  languagePicker: document.querySelector('#language-picker'),
  languageButton: document.querySelector('#language-button'),
  languageFlag: document.querySelector('#language-flag'),
  languageMenu: document.querySelector('#language-menu'),
  emptyImportButton: document.querySelector('#empty-import-button'),
  sampleButton: document.querySelector('#sample-button'),
  exportButton: document.querySelector('#export-button'),
  resolutionInput: document.querySelector('#resolution-input'),
  resolutionOutput: document.querySelector('#resolution-output'),
  documentStatus: document.querySelector('#document-status'),
  sourceCanvas: document.querySelector('#source-canvas'),
  source3dStage: document.querySelector('#source-3d-stage'),
  source3dCanvas: document.querySelector('#source-3d-canvas'),
  threeLoading: document.querySelector('#three-loading'),
  resultCanvas: document.querySelector('#result-canvas'),
  proofWhiteCanvas: document.querySelector('#proof-white-canvas'),
  proofBlackCanvas: document.querySelector('#proof-black-canvas'),
  proofDimensions: document.querySelector('#proof-dimensions'),
  proofStatus: document.querySelector('#proof-status'),
  sourceSurface: document.querySelector('#source-surface'),
  resultSurface: document.querySelector('#result-surface'),
  dropHint: document.querySelector('#drop-hint'),
  dropHint3d: document.querySelector('#drop-hint-3d'),
  modelImportButton: document.querySelector('#model-import-button'),
  resultEmpty: document.querySelector('#result-empty'),
  sourceDimensions: document.querySelector('#source-dimensions'),
  resultDimensions: document.querySelector('#result-dimensions'),
  resultColors: document.querySelector('#result-colors'),
  sourceFileLabel: document.querySelector('#source-file-label'),
  moveScaleHint: document.querySelector('#source-panel .footer-hint'),
  resultStatus: document.querySelector('#result-status'),
  generateButton: document.querySelector('#generate-button'),
  liveToggle: document.querySelector('#live-toggle'),
  paletteRange: document.querySelector('#palette-range'),
  contrastRange: document.querySelector('#contrast-range'),
  edgesRange: document.querySelector('#edges-range'),
  paletteValue: document.querySelector('#palette-value'),
  contrastValue: document.querySelector('#contrast-value'),
  edgesValue: document.querySelector('#edges-value'),
  removeBackgroundToggle: document.querySelector('#remove-background-toggle'),
  borderToggle: document.querySelector('#border-toggle'),
  borderColor: document.querySelector('#border-color'),
  borderColorValue: document.querySelector('#border-color-value'),
  borderWidth: document.querySelector('#border-width'),
  borderWidthValue: document.querySelector('#border-width-value'),
  sourceZoomValue: document.querySelector('#source-zoom-value'),
  resultZoomValue: document.querySelector('#result-zoom-value'),
  sourceFit: document.querySelector('#source-fit'),
  sourceCenter: document.querySelector('#source-center'),
  resultFit: document.querySelector('#result-fit'),
  toast: document.querySelector('#toast'),
};

const ctx = {
  source: els.sourceCanvas.getContext('2d'),
  result: els.resultCanvas.getContext('2d'),
};

let worker = null;
let workerReady = false;
let toastTimer = null;
let pointerDrag = null;
let liveTimer = null;
let sourceEffectTimer = null;
let modelLoadToken = 0;

try {
  worker = new Worker('./pipeline-worker.js', { type: 'module' });
  workerReady = true;
  worker.addEventListener('message', handleWorkerMessage);
  worker.addEventListener('error', () => {
    workerReady = false;
    setStatus(t('workerFallback'), 'warning');
  });
} catch {
  workerReady = false;
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function formatPercent(value) { return `${Math.round(value * 100)}%`; }

function readLocale() {
  try {
    const saved = localStorage.getItem(localeStorageKey);
    return localeMeta[saved] ? saved : 'en';
  } catch { return 'en'; }
}

function applyLocale(locale) {
  currentLocale = localeMeta[locale] ? locale : 'en';
  state.locale = currentLocale;
  document.documentElement.lang = currentLocale;
  document.title = `Pixel Forge — ${t('pixelArtResult')}`;
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel)); });
  els.languageFlag.textContent = localeMeta[currentLocale].flag;
  els.languageButton.setAttribute('aria-label', t('languageButton'));
  els.languageMenu.querySelectorAll('[data-locale]').forEach((button) => button.classList.toggle('is-active', button.dataset.locale === currentLocale));
  updateResolutionUI();
  updatePipelineUI();
  updateSourceTreatmentUI();
  updateModeUI();
  drawProofPreviews(state.output);
  if (!hasActiveSource()) els.resultStatus.textContent = t('waitingForImage');
  else if (state.busy) els.resultStatus.textContent = t('forgeProgress');
  else if (state.output && state.lastElapsedMs != null) els.resultStatus.textContent = t('generated', { value: state.lastElapsedMs });
  else els.resultStatus.textContent = t('waiting');
}

function buildLanguageMenu() {
  els.languageMenu.innerHTML = Object.entries(localeMeta).map(([code, meta]) => `
    <button type="button" class="language-option${code === currentLocale ? ' is-active' : ''}" data-locale="${code}" role="menuitem">
      <span aria-hidden="true">${meta.flag}</span><span>${meta.name}</span>
    </button>`).join('');
  els.languageMenu.querySelectorAll('[data-locale]').forEach((button) => button.addEventListener('click', () => {
    currentLocale = button.dataset.locale;
    try { localStorage.setItem(localeStorageKey, currentLocale); } catch { /* private mode */ }
    applyLocale(currentLocale);
    closeLanguageMenu();
  }));
}

function closeLanguageMenu() {
  els.languageMenu.hidden = true;
  els.languageButton.setAttribute('aria-expanded', 'false');
}

function toggleLanguageMenu() {
  const isOpen = !els.languageMenu.hidden;
  els.languageMenu.hidden = isOpen;
  els.languageButton.setAttribute('aria-expanded', String(!isOpen));
}

function setStatus(message, tone = 'ready') {
  const dot = els.documentStatus.querySelector('.status-dot');
  els.documentStatus.querySelector('span:last-child').textContent = message;
  dot.style.background = tone === 'warning' || tone === 'busy' ? 'var(--amber)' : 'var(--cyan)';
  dot.style.boxShadow = `0 0 10px ${tone === 'warning' || tone === 'busy' ? 'var(--amber)' : 'var(--cyan)'}`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 3000);
}

function hasActiveSource() {
  return state.mode === '3d' ? Boolean(state.three.modelRoot) : Boolean(state.image);
}

function saveActiveOutput() {
  state.outputs[state.mode] = { output: state.output, usedColors: state.usedColors, lastElapsedMs: state.lastElapsedMs };
}

function restoreModeOutput() {
  const saved = state.outputs[state.mode] || {};
  state.output = saved.output || null;
  state.usedColors = saved.usedColors ?? null;
  state.lastElapsedMs = saved.lastElapsedMs ?? null;
}

function updateModeUI() {
  const is3d = state.mode === '3d';
  els.mode2d.classList.toggle('is-active', !is3d);
  els.mode3d.classList.toggle('is-active', is3d);
  els.mode2d.setAttribute('aria-pressed', String(!is3d));
  els.mode3d.setAttribute('aria-pressed', String(is3d));
  els.importButton.textContent = t(is3d ? 'importModel' : 'importImage');
  els.fileInput.accept = is3d ? '.glb,.gltf,.obj,.fbx,.mtl' : 'image/*';
  els.fileInput.multiple = is3d;
  els.sourceCanvas.hidden = is3d;
  els.source3dStage.hidden = !is3d;
  els.dropHint.hidden = is3d || Boolean(state.image);
  els.dropHint3d.hidden = !is3d || Boolean(state.three.modelRoot);
  els.sourceFit.hidden = is3d;
  els.sourceCenter.textContent = t(is3d ? 'resetView' : 'center');
  els.sourceCenter.dataset.i18n = is3d ? 'resetView' : 'center';
  els.sourceSurface.dataset.mode = state.mode;
  els.sourceSurface.dataset.empty = hasActiveSource() ? 'false' : 'true';
  const sourceTitle = document.querySelector('#source-panel h2');
  const sourceKicker = document.querySelector('#source-panel .section-kicker');
  if (sourceTitle) sourceTitle.textContent = t(is3d ? 'modelSource' : 'sourceImage');
  if (sourceKicker) sourceKicker.textContent = t(is3d ? 'modelKicker' : 'sourceKicker');
  els.sourceCanvas.setAttribute('aria-label', t(is3d ? 'modelCanvas' : 'sourceCanvas'));
  els.sourceFileLabel.textContent = is3d
    ? (state.model.name ? `${state.model.name} · 3D` : t('noModelLoaded'))
    : (state.image ? `${state.fileName} · ${state.image.naturalWidth} × ${state.image.naturalHeight}` : t('noImageLoaded'));
  els.moveScaleHint.textContent = t(is3d ? 'orbitZoomHint' : 'moveScaleHint');
  const resultCopy = els.resultEmpty.querySelectorAll('span, strong');
  if (resultCopy[0]) resultCopy[0].textContent = t(is3d ? 'modelResultAppearsHere' : 'resultAppearsHere');
  if (resultCopy[1]) resultCopy[1].textContent = t(is3d ? 'importModelToStart' : 'importToStart');
  els.generateButton.disabled = !hasActiveSource() || state.busy;
  els.exportButton.disabled = !state.output;
  els.resultStatus.textContent = state.output && state.lastElapsedMs != null
    ? t('generated', { value: state.lastElapsedMs })
    : (hasActiveSource() ? t('waiting') : t('waitingForImage'));
  updateResolutionUI();
  updatePipelineUI();
}

function initializeThree() {
  if (state.three.initialized) return !state.three.error;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas: els.source3dCanvas, alpha: true, antialias: true, preserveDrawingBuffer: false });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    camera.position.set(0, 0.18, 3.2);
    const controls = new OrbitControls(camera, els.source3dCanvas);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.35;
    controls.maxDistance = 12;
    controls.addEventListener('change', () => { renderThreeFrame(); if (state.mode === '3d' && state.pipeline.live) scheduleGenerate(180); });
    scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x253044, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fc8ff, 0.55); fill.position.set(-4, 2, 2); scene.add(fill);
    state.three = { ...state.three, renderer, scene, camera, controls, initialized: true, error: false };
    updateThreeRendererSize();
    requestAnimationFrame(animateThree);
    return true;
  } catch (error) {
    console.error(error);
    state.three.initialized = true;
    state.three.error = true;
    showToast(t('webglError'));
    return false;
  }
}

function animateThree() {
  if (!state.three.renderer) return;
  requestAnimationFrame(animateThree);
  state.three.controls?.update();
  renderThreeFrame();
}

function updateThreeRendererSize() {
  if (!state.three.renderer || !state.three.camera) return;
  const size = getCanvasDisplaySize(els.sourceSurface, state.viewZoom.source);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  els.source3dStage.style.width = `${size}px`;
  els.source3dStage.style.height = `${size}px`;
  els.source3dCanvas.style.width = `${size}px`;
  els.source3dCanvas.style.height = `${size}px`;
  state.three.renderer.setSize(Math.min(2048, Math.max(256, Math.round(size * dpr))), Math.min(2048, Math.max(256, Math.round(size * dpr))), false);
  state.three.camera.aspect = 1;
  state.three.camera.updateProjectionMatrix();
}

function renderThreeFrame() {
  if (state.mode === '3d' && state.three.renderer && state.three.scene && state.three.camera) state.three.renderer.render(state.three.scene, state.three.camera);
}

function disposeThreeObject(object) {
  if (!object) return;
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach((material) => {
      Object.values(material).forEach((value) => { if (value?.isTexture) value.dispose(); });
      material.dispose?.();
    });
  });
}

function resetThreeView() {
  if (!state.three.modelRoot || !state.three.camera || !state.three.controls) return;
  const box = new THREE.Box3().setFromObject(state.three.modelRoot);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const distance = maxDim * 2.2;
  state.three.camera.position.set(maxDim * 0.12, maxDim * 0.28, distance);
  state.three.camera.near = Math.max(0.01, maxDim / 100);
  state.three.camera.far = maxDim * 20;
  state.three.camera.updateProjectionMatrix();
  state.three.controls.target.set(0, 0, 0);
  state.three.controls.update();
  state.three.initialCamera = { position: state.three.camera.position.clone(), target: state.three.controls.target.clone() };
  renderThreeFrame();
  if (state.pipeline.live) scheduleGenerate(120);
}

function normalizeThreeModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  root.position.sub(center);
  root.scale.setScalar(1.8 / maxDim);
  root.updateMatrixWorld(true);
  resetThreeView();
}

function fileNameOf(url) {
  return decodeURIComponent(url.split(/[\\/]/).pop().split('?')[0]);
}

function prepareModelUrls(files) {
  const urls = new Map();
  const objectUrls = [];
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    objectUrls.push(url);
    urls.set(file.name, url);
    urls.set(fileNameOf(file.name), url);
  });
  return { urls, objectUrls };
}

function installThreeModel(root, name, objectUrls, neutralMaterial = false) {
  if (!state.three.scene) return;
  if (state.three.modelRoot) { state.three.scene.remove(state.three.modelRoot); disposeThreeObject(state.three.modelRoot); }
  state.three.objectUrls.forEach((url) => URL.revokeObjectURL(url));
  state.three.objectUrls = objectUrls;
  state.three.modelRoot = root;
  state.model.root = root;
  state.model.name = name;
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = false;
    if (!node.material) node.material = new THREE.MeshStandardMaterial({ color: 0x91a8b8, roughness: 0.72, metalness: 0.05 });
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      if (neutralMaterial && material.color) material.color.set(0x91a8b8);
      if (neutralMaterial && 'roughness' in material) material.roughness = 0.72;
      if (neutralMaterial && 'metalness' in material) material.metalness = 0.05;
      material.needsUpdate = true;
    });
  });
  state.three.scene.add(root);
  normalizeThreeModel(root);
  state.output = null;
  state.usedColors = null;
  state.lastElapsedMs = null;
  state.outputs['3d'] = { output: null, usedColors: null, lastElapsedMs: null };
  updateModeUI();
  updateCanvasViews();
  setStatus(t('modelReady'), 'ready');
  scheduleGenerate(80);
}

function loadModelFiles(fileList) {
  if (!initializeThree()) return;
  const files = [...(fileList || [])];
  const rootFile = files.find((file) => /\.(glb|gltf|obj|fbx)$/i.test(file.name));
  if (!rootFile) { showToast(t('modelLoadError')); return; }
  const token = ++modelLoadToken;
  const { urls, objectUrls } = prepareModelUrls(files);
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => urls.get(fileNameOf(url)) || urls.get(url) || url);
  els.threeLoading.hidden = false;
  els.sourceSurface.dataset.empty = 'false';
  setStatus(t('loadingModel'), 'busy');
  const neutralObj = /\.obj$/i.test(rootFile.name) && !files.some((file) => /\.mtl$/i.test(file.name));
  const onLoaded = (root) => {
    if (token !== modelLoadToken) { objectUrls.forEach((url) => URL.revokeObjectURL(url)); return; }
    els.threeLoading.hidden = true;
    installThreeModel(root, rootFile.name, objectUrls, neutralObj);
  };
  const onError = (error) => {
    if (token !== modelLoadToken) return;
    els.threeLoading.hidden = true;
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    console.error(error);
    state.model.root = null;
    state.three.modelRoot = null;
    updateModeUI();
    setStatus(t('modelLoadError'), 'warning');
    showToast(t('modelLoadError'));
  };
  if (/\.obj$/i.test(rootFile.name)) {
    const mtlFile = files.find((file) => /\.mtl$/i.test(file.name));
    const finishObj = (materials) => {
      const loader = new OBJLoader(manager);
      if (materials) { materials.preload(); loader.setMaterials(materials); }
      loader.load(urls.get(rootFile.name), onLoaded, undefined, onError);
    };
    if (mtlFile) new MTLLoader(manager).load(urls.get(mtlFile.name), finishObj, undefined, onError);
    else finishObj(null);
  } else if (/\.fbx$/i.test(rootFile.name)) {
    new FBXLoader(manager).load(urls.get(rootFile.name), onLoaded, undefined, onError);
  } else {
    new GLTFLoader(manager).load(urls.get(rootFile.name), (gltf) => onLoaded(gltf.scene || gltf.scenes?.[0]), undefined, onError);
  }
}

function switchMode(mode) {
  if (mode === state.mode) return;
  saveActiveOutput();
  state.mode = mode;
  restoreModeOutput();
  if (mode === '3d' && !initializeThree()) { state.mode = '2d'; restoreModeOutput(); updateModeUI(); return; }
  updateModeUI();
  updateCanvasViews();
  renderAll();
}

function updateResolutionUI() {
  const value = state.resolution;
  els.resolutionInput.value = value;
  els.resolutionOutput.textContent = value;
  els.sourceDimensions.textContent = `${value} × ${value}`;
  els.resultDimensions.textContent = `PNG · ${value} × ${value}`;
  els.proofDimensions.textContent = `${value} × ${value}`;
  document.querySelectorAll('.preset-button').forEach((button) => button.classList.toggle('is-active', Number(button.dataset.resolution) === value));
}

function updatePipelineUI() {
  els.paletteValue.textContent = t('colors', { value: state.pipeline.palette });
  els.contrastValue.textContent = `${state.pipeline.contrast}%`;
  els.edgesValue.textContent = `${state.pipeline.edges}%`;
  els.resultColors.textContent = state.usedColors == null
    ? `— / ${t('colors', { value: state.pipeline.palette })}`
    : `${state.usedColors} / ${t('colors', { value: state.pipeline.palette })}`;
}

function updateSourceTreatmentUI() {
  els.removeBackgroundToggle.checked = state.sourceEffects.removeBackground;
  els.borderToggle.checked = state.sourceEffects.borderEnabled;
  els.borderColor.value = state.sourceEffects.borderColor;
  els.borderColorValue.textContent = state.sourceEffects.borderColor.toUpperCase();
  els.borderWidth.value = state.sourceEffects.borderWidth;
  els.borderWidthValue.textContent = `${state.sourceEffects.borderWidth} px`;
  const disabled = !state.sourceEffects.borderEnabled;
  els.borderColor.disabled = disabled;
  els.borderWidth.disabled = disabled;
}

function setupResultCanvas(canvas) {
  canvas.width = state.resolution;
  canvas.height = state.resolution;
  canvas.style.width = '';
  canvas.style.height = '';
}

function getCanvasDisplaySize(surface, zoom) {
  const available = Math.max(160, Math.min(500, surface.clientWidth - 42));
  return Math.max(80, Math.round(available * zoom));
}

function setupSourceCanvas() {
  const displaySize = getCanvasDisplaySize(els.sourceSurface, state.viewZoom.source);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const backingSize = Math.min(2048, Math.max(512, Math.round(displaySize * dpr)));
  if (els.sourceCanvas.width !== backingSize || els.sourceCanvas.height !== backingSize) {
    els.sourceCanvas.width = backingSize;
    els.sourceCanvas.height = backingSize;
  }
  els.sourceCanvas.style.width = `${displaySize}px`;
  els.sourceCanvas.style.height = `${displaySize}px`;
  return backingSize / state.resolution;
}

function updateCanvasView(canvas, surface, zoom) {
  const size = getCanvasDisplaySize(surface, zoom);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
}

function updateCanvasViews() {
  if (state.mode === '3d') {
    updateThreeRendererSize();
    renderThreeFrame();
  } else {
    updateCanvasView(els.sourceCanvas, els.sourceSurface, state.viewZoom.source);
  }
  updateCanvasView(els.resultCanvas, els.resultSurface, state.viewZoom.result);
  els.sourceZoomValue.textContent = formatPercent(state.viewZoom.source);
  els.resultZoomValue.textContent = formatPercent(state.viewZoom.result);
}

function drawCheckerboard(ctx2d, width, height, cellSize = 8) {
  ctx2d.clearRect(0, 0, width, height);
  ctx2d.fillStyle = '#101722';
  ctx2d.fillRect(0, 0, width, height);
  ctx2d.fillStyle = '#162231';
  for (let y = 0; y < height; y += cellSize) {
    for (let x = (y / cellSize) % 2 ? 0 : cellSize; x < width; x += cellSize * 2) ctx2d.fillRect(x, y, cellSize, cellSize);
  }
}

function drawGrid(ctx2d, resolution, color = 'rgba(110, 215, 210, .11)', scale = 1) {
  const step = resolution > 256 ? 4 : 1;
  ctx2d.save();
  ctx2d.strokeStyle = color;
  ctx2d.lineWidth = (resolution > 256 ? 0.35 : 0.22) * scale;
  ctx2d.beginPath();
  for (let i = 0; i <= resolution; i += step) {
    ctx2d.moveTo((i + .5) * scale, 0); ctx2d.lineTo((i + .5) * scale, resolution * scale);
    ctx2d.moveTo(0, (i + .5) * scale); ctx2d.lineTo(resolution * scale, (i + .5) * scale);
  }
  ctx2d.stroke();
  ctx2d.restore();
}

function calculateBaseScale() {
  if (!state.image) return 1;
  const padding = state.resolution * .86;
  return Math.min(padding / state.image.naturalWidth, padding / state.image.naturalHeight);
}

function getImageRect() {
  if (!state.image) return null;
  const scale = state.baseScale * state.transform.scale;
  const width = state.image.naturalWidth * scale;
  const height = state.image.naturalHeight * scale;
  return { x: state.transform.x - width / 2, y: state.transform.y - height / 2, width, height };
}

function effectConfig(scale) {
  // Border width is expressed in logical output pixels. The source/effect
  // buffer is supersampled, so compensate for the inclusive dilation window
  // to keep 1 px equal to exactly one pixel-art cell after reduction.
  const supersample = Math.max(1, Math.round(scale));
  return {
    removeBackground: state.sourceEffects.removeBackground,
    backgroundTolerance: state.sourceEffects.backgroundTolerance,
    borderEnabled: state.sourceEffects.borderEnabled,
    borderWidth: Math.max(1, state.sourceEffects.borderWidth * supersample - 1),
    borderColor: state.sourceEffects.borderColor,
  };
}

function renderTransformedPixels(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const composite = canvas.getContext('2d', { willReadFrequently: true });
  composite.clearRect(0, 0, size, size);
  if (state.image) {
    const rect = getImageRect();
    composite.imageSmoothingEnabled = true;
    composite.imageSmoothingQuality = 'high';
    composite.drawImage(state.image, rect.x * size / state.resolution, rect.y * size / state.resolution, rect.width * size / state.resolution, rect.height * size / state.resolution);
  }
  const pixels = composite.getImageData(0, 0, size, size);
  if (!state.sourceEffects.removeBackground && !state.sourceEffects.borderEnabled) return pixels;
  const result = pipeline.applySourceEffects(pixels.data, size, size, effectConfig(size / state.resolution));
  return new ImageData(new Uint8ClampedArray(result.pixels), size, size);
}

function drawSource() {
  if (state.mode === '3d') {
    updateModeUI();
    updateThreeRendererSize();
    renderThreeFrame();
    return;
  }
  const resolution = state.resolution;
  const scale = setupSourceCanvas();
  const canvasSize = Math.round(resolution * scale);
  drawCheckerboard(ctx.source, canvasSize, canvasSize, Math.max(8, 8 * scale));
  if (state.image) {
    const rect = getImageRect();
    ctx.source.putImageData(renderTransformedPixels(canvasSize), 0, 0);
    drawSelection(ctx.source, rect, scale);
  }
  drawGrid(ctx.source, resolution, 'rgba(110, 215, 210, .18)', scale);
  els.sourceSurface.dataset.empty = state.image ? 'false' : 'true';
  els.dropHint.hidden = Boolean(state.image);
}

function drawSelection(ctx2d, rect, scale = 1) {
  ctx2d.save();
  ctx2d.strokeStyle = 'rgba(242, 179, 94, .85)';
  ctx2d.lineWidth = .7 * scale;
  ctx2d.setLineDash([3, 2]);
  ctx2d.strokeRect(rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale);
  ctx2d.setLineDash([]);
  const handle = Math.max(5, Math.min(10, state.resolution / 45 * scale));
  ctx2d.fillStyle = '#f2b35e';
  [[rect.x, rect.y], [rect.x + rect.width, rect.y], [rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]].forEach(([x, y]) => ctx2d.fillRect(x * scale - handle / 2, y * scale - handle / 2, handle, handle));
  ctx2d.restore();
}

function drawResult(imageData) {
  setupResultCanvas(els.resultCanvas);
  drawCheckerboard(ctx.result, state.resolution, state.resolution);
  if (imageData) {
    ctx.result.putImageData(imageData, 0, 0);
    drawGrid(ctx.result, state.resolution, 'rgba(236, 243, 246, .13)');
    els.resultSurface.dataset.empty = 'false';
    els.resultEmpty.hidden = true;
  } else {
    els.resultSurface.dataset.empty = 'true';
    els.resultEmpty.hidden = false;
  }
  drawProofPreviews(imageData);
}

function drawProofCanvas(canvas, imageData, background) {
  canvas.width = state.resolution;
  canvas.height = state.resolution;
  canvas.style.width = `${state.resolution}px`;
  canvas.style.height = `${state.resolution}px`;
  const proofContext = canvas.getContext('2d');
  proofContext.imageSmoothingEnabled = false;
  proofContext.fillStyle = background;
  proofContext.fillRect(0, 0, state.resolution, state.resolution);
  if (imageData) proofContext.putImageData(imageData, 0, 0);
}

function drawProofPreviews(imageData) {
  drawProofCanvas(els.proofWhiteCanvas, imageData, '#ffffff');
  drawProofCanvas(els.proofBlackCanvas, imageData, '#000000');
  els.proofStatus.textContent = imageData ? t('proofReady') : t('proofWaiting');
}

function renderAll() {
  updateResolutionUI();
  updatePipelineUI();
  updateModeUI();
  drawSource();
  drawResult(state.output);
  requestAnimationFrame(updateCanvasViews);
}

function centerImage() {
  state.transform.x = state.resolution / 2;
  state.transform.y = state.resolution / 2;
  drawSource();
}

function fitImage() {
  state.baseScale = calculateBaseScale();
  state.transform.scale = 1;
  centerImage();
  scheduleGenerate();
}

function resizeDocument(value) {
  const next = clamp(Math.round(Number(value) || 128), 16, 512);
  const ratio = next / state.resolution;
  state.resolution = next;
  state.transform.x *= ratio;
  state.transform.y *= ratio;
  state.baseScale = calculateBaseScale();
  state.output = null;
  state.usedColors = null;
  state.lastElapsedMs = null;
  els.exportButton.disabled = true;
  els.resultColors.textContent = `— / ${t('colors', { value: state.pipeline.palette })}`;
  els.resultStatus.textContent = state.image ? t('regenerating') : t('waitingForImage');
  renderAll();
  if (hasActiveSource()) scheduleGenerate();
}

function getCanvasPoint(event) {
  const rect = els.sourceCanvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * state.resolution / rect.width, y: (event.clientY - rect.top) * state.resolution / rect.height };
}

function hitCorner(point, rect) {
  const threshold = Math.max(5, state.resolution * .035);
  const corners = { nw: [rect.x, rect.y], ne: [rect.x + rect.width, rect.y], sw: [rect.x, rect.y + rect.height], se: [rect.x + rect.width, rect.y + rect.height] };
  return Object.entries(corners).find(([, [x, y]]) => Math.hypot(point.x - x, point.y - y) <= threshold)?.[0] || null;
}

function handlePointerDown(event) {
  if (state.mode !== '2d' || !state.image) return;
  event.preventDefault();
  const point = getCanvasPoint(event);
  const rect = getImageRect();
  const corner = hitCorner(point, rect);
  const inside = point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  if (!corner && !inside) return;
  pointerDrag = { pointerId: event.pointerId, mode: corner ? 'scale' : 'move', start: point, initial: { ...state.transform }, initialDistance: Math.hypot(point.x - state.transform.x, point.y - state.transform.y) };
  els.sourceCanvas.setPointerCapture(event.pointerId);
  els.sourceCanvas.classList.add('is-dragging');
}

function handlePointerMove(event) {
  if (!pointerDrag || state.mode !== '2d' || !state.image) return;
  const point = getCanvasPoint(event);
  if (pointerDrag.mode === 'move') {
    state.transform.x = pointerDrag.initial.x + point.x - pointerDrag.start.x;
    state.transform.y = pointerDrag.initial.y + point.y - pointerDrag.start.y;
  } else {
    const distance = Math.max(4, Math.hypot(point.x - state.transform.x, point.y - state.transform.y));
    const nextScale = pointerDrag.initial.scale * (distance / Math.max(4, pointerDrag.initialDistance));
    state.transform.scale = clamp(nextScale, .12, 8);
  }
  drawSource();
  if (state.pipeline.live) scheduleGenerate(220);
}

function handlePointerUp() {
  if (!pointerDrag) return;
  pointerDrag = null;
  els.sourceCanvas.classList.remove('is-dragging');
  if (state.mode === '2d' && state.image) scheduleGenerate(100);
}

function renderComposite() {
  const factor = Math.min(4, Math.max(2, Math.ceil(1024 / state.resolution)));
  const width = state.resolution * factor;
  if (state.mode === '3d') return captureThreePixels(width);
  return { pixels: renderTransformedPixels(width), width, height: width };
}

function captureThreePixels(size) {
  const { renderer, scene, camera } = state.three;
  if (!renderer || !scene || !camera) return { pixels: new ImageData(size, size), width: size, height: size };
  const target = new THREE.WebGLRenderTarget(size, size, { format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: true, stencilBuffer: false });
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 0);
  renderer.clear(true, true, true);
  renderer.render(scene, camera);
  const pixels = new Uint8Array(size * size * 4);
  renderer.readRenderTargetPixels(target, 0, 0, size, size, pixels);
  renderer.setRenderTarget(null);
  target.dispose();
  const flipped = new Uint8ClampedArray(pixels.length);
  for (let y = 0; y < size; y += 1) {
    const sourceRow = (size - 1 - y) * size * 4;
    flipped.set(pixels.subarray(sourceRow, sourceRow + size * 4), y * size * 4);
  }
  const effects = pipeline.applySourceEffects(flipped, size, size, effectConfig(size / state.resolution));
  return { pixels: new ImageData(new Uint8ClampedArray(effects.pixels), size, size), width: size, height: size };
}

function scheduleGenerate(delay = 180) {
  if (!hasActiveSource()) return;
  clearTimeout(liveTimer);
  liveTimer = setTimeout(generate, delay);
}

function generate() {
  if (!hasActiveSource() || state.busy) return;
  state.busy = true;
  const requestId = ++state.requestId;
  setStatus(t('processing'), 'busy');
  els.resultStatus.textContent = t('forgeProgress');
  els.generateButton.disabled = true;
  const composite = renderComposite();
  const config = { resolution: state.resolution, maxColors: state.pipeline.palette, contrast: state.pipeline.contrast, edgeStrength: state.pipeline.edges };
  if (workerReady && worker) {
    const buffer = composite.pixels.data.buffer;
    worker.postMessage({ requestId, width: composite.width, height: composite.height, pixels: buffer, config }, [buffer]);
  } else {
    setTimeout(() => handlePipelineResult(requestId, pipeline.processImageData(composite.pixels.data, composite.width, composite.height, config)), 0);
  }
}

function handleWorkerMessage(event) {
  if (event.data.type === 'error') {
    workerReady = false;
    setStatus(t('workerFallback'), 'warning');
    return;
  }
  handlePipelineResult(event.data.requestId, event.data);
}

function handlePipelineResult(requestId, result) {
  if (requestId !== state.requestId) return;
  const pixels = result.pixels instanceof ArrayBuffer ? new Uint8ClampedArray(result.pixels) : result.pixels;
  state.output = new ImageData(pixels, state.resolution, state.resolution);
  state.busy = false;
  state.usedColors = result.usedColors;
  state.lastElapsedMs = result.elapsedMs;
  saveActiveOutput();
  updatePipelineUI();
  els.resultStatus.textContent = t('generated', { value: result.elapsedMs });
  els.exportButton.disabled = false;
  els.generateButton.disabled = false;
  setStatus(t('forgeReady'), 'ready');
  drawResult(state.output);
  updateModeUI();
  requestAnimationFrame(updateCanvasViews);
}

function loadImageSource(source, fileName, revokeSource = false) {
  if (state.sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(state.sourceUrl);
  state.sourceUrl = revokeSource ? source : null;
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.fileName = fileName || 'pasted-image.png';
    state.baseScale = calculateBaseScale();
    state.transform = { x: state.resolution / 2, y: state.resolution / 2, scale: 1 };
    state.output = null;
    state.usedColors = null;
    state.lastElapsedMs = null;
    els.sourceFileLabel.textContent = `${state.fileName} · ${image.naturalWidth} × ${image.naturalHeight}`;
    els.generateButton.disabled = false;
    els.exportButton.disabled = true;
    updatePipelineUI();
    renderAll();
    setStatus(t('sourceReady'), 'ready');
    scheduleGenerate(80);
  };
  image.onerror = () => { if (revokeSource) URL.revokeObjectURL(source); showToast(t('imageReadError')); };
  image.src = source;
}

function loadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast(t('noValidImage'));
    return;
  }
  const url = URL.createObjectURL(file);
  loadImageSource(url, file.name || 'pasted-image.png', true);
}

function handleDrop(event) {
  event.preventDefault();
  els.sourceSurface.classList.remove('is-dragging');
  const files = [...(event.dataTransfer?.files || [])];
  if (state.mode === '3d') loadModelFiles(files);
  else {
    const file = files.find((item) => item.type.startsWith('image/'));
    if (file) loadImageFile(file); else showToast(t('dropImage'));
  }
}

function handlePaste(event) {
  if (state.mode !== '2d') return;
  const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith('image/'));
  if (!item) return;
  const file = item.getAsFile();
  if (file) { event.preventDefault(); loadImageFile(file); }
}

function updateRange(key, value) {
  state.pipeline[key] = Number(value);
  updatePipelineUI();
  if (hasActiveSource() && state.pipeline.live) scheduleGenerate();
}

function updateSourceEffect(key, value) {
  if (key === 'removeBackground' || key === 'borderEnabled') state.sourceEffects[key] = Boolean(value);
  else if (key === 'borderWidth') state.sourceEffects.borderWidth = clamp(Number(value) || 2, 1, 8);
  else if (key === 'borderColor') state.sourceEffects.borderColor = value || '#131313';
  updateSourceTreatmentUI();
  clearTimeout(sourceEffectTimer);
  sourceEffectTimer = setTimeout(() => {
    sourceEffectTimer = null;
    drawSource();
    if (hasActiveSource() && state.pipeline.live) scheduleGenerate(180);
  }, key === 'borderColor' ? 80 : 40);
}

function updateViewZoom(key, delta) {
  state.viewZoom[key] = clamp(Math.round((state.viewZoom[key] + delta) * 100) / 100, .5, 3);
  updateCanvasViews();
}

function exportPng() {
  if (!state.output) return;
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.resolution;
  exportCanvas.height = state.resolution;
  exportCanvas.getContext('2d').putImageData(state.output, 0, 0);
  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixelart-${state.resolution}x${state.resolution}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(t('exported', { value: state.resolution }));
  }, 'image/png');
}

els.importButton.addEventListener('click', () => els.fileInput.click());
els.emptyImportButton.addEventListener('click', () => els.fileInput.click());
els.modelImportButton.addEventListener('click', () => els.fileInput.click());
els.sampleButton.addEventListener('click', () => {
  let index = Math.floor(Math.random() * sampleAssets.length);
  if (sampleAssets.length > 1 && index === lastSampleIndex) index = (index + 1) % sampleAssets.length;
  lastSampleIndex = index;
  const sample = sampleAssets[index];
  loadImageSource(sample.source, sample.name);
});
els.fileInput.addEventListener('change', (event) => {
  if (state.mode === '3d') loadModelFiles(event.target.files);
  else loadImageFile(event.target.files[0]);
  event.target.value = '';
});
els.mode2d.addEventListener('click', () => switchMode('2d'));
els.mode3d.addEventListener('click', () => switchMode('3d'));
els.exportButton.addEventListener('click', exportPng);
els.resolutionInput.addEventListener('change', (event) => resizeDocument(event.target.value));
document.querySelectorAll('.preset-button').forEach((button) => button.addEventListener('click', () => resizeDocument(button.dataset.resolution)));
els.liveToggle.addEventListener('change', (event) => { state.pipeline.live = event.target.checked; if (state.pipeline.live) scheduleGenerate(); });
els.generateButton.addEventListener('click', generate);
els.paletteRange.addEventListener('input', (event) => updateRange('palette', event.target.value));
els.contrastRange.addEventListener('input', (event) => updateRange('contrast', event.target.value));
els.edgesRange.addEventListener('input', (event) => updateRange('edges', event.target.value));
els.removeBackgroundToggle.addEventListener('change', (event) => updateSourceEffect('removeBackground', event.target.checked));
els.borderToggle.addEventListener('change', (event) => updateSourceEffect('borderEnabled', event.target.checked));
els.borderColor.addEventListener('input', (event) => {
  // Keep the native picker responsive: only update the lightweight label here.
  els.borderColorValue.textContent = event.target.value.toUpperCase();
});
els.borderColor.addEventListener('change', (event) => updateSourceEffect('borderColor', event.target.value));
els.borderWidth.addEventListener('input', (event) => updateSourceEffect('borderWidth', event.target.value));
els.sourceFit.addEventListener('click', fitImage);
els.sourceCenter.addEventListener('click', () => {
  if (state.mode === '3d') resetThreeView();
  else { centerImage(); scheduleGenerate(); }
});
els.resultFit.addEventListener('click', () => { state.viewZoom.result = 1; updateCanvasViews(); });
document.querySelector('#source-zoom-out').addEventListener('click', () => { updateViewZoom('source', -.25); drawSource(); });
document.querySelector('#source-zoom-in').addEventListener('click', () => { updateViewZoom('source', .25); drawSource(); });
document.querySelector('#result-zoom-out').addEventListener('click', () => updateViewZoom('result', -.25));
document.querySelector('#result-zoom-in').addEventListener('click', () => updateViewZoom('result', .25));
els.sourceCanvas.addEventListener('pointerdown', handlePointerDown);
els.sourceCanvas.addEventListener('pointermove', handlePointerMove);
els.sourceCanvas.addEventListener('pointerup', handlePointerUp);
els.sourceCanvas.addEventListener('pointercancel', handlePointerUp);
els.sourceSurface.addEventListener('dragover', (event) => { event.preventDefault(); els.sourceSurface.classList.add('is-dragging'); });
els.sourceSurface.addEventListener('dragleave', (event) => { if (!els.sourceSurface.contains(event.relatedTarget)) els.sourceSurface.classList.remove('is-dragging'); });
els.sourceSurface.addEventListener('drop', handleDrop);
window.addEventListener('paste', handlePaste);
window.addEventListener('resize', () => { updateCanvasViews(); drawSource(); });

currentLocale = readLocale();
buildLanguageMenu();
applyLocale(currentLocale);
els.languageButton.addEventListener('click', toggleLanguageMenu);
document.addEventListener('click', (event) => { if (!els.languagePicker.contains(event.target)) closeLanguageMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLanguageMenu(); });
updateSourceTreatmentUI();
updateModeUI();

renderAll();
