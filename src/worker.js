/////////////////////////////////////////////////////
// Finally open-sourcing this code after a long time.
/////////////////////////////////////////////////////

// super legit user agent hehe
const user_agent_list = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) livetogain/1.2.1 Chrome/142.0.7444.235 Electron/39.2.7 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 YaBrowser/25.12.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.151 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.151 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 15; F-52E Build/V35RD53A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0 (Edition std-2)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) obsidian/1.5.12 Chrome/120.0.6099.283 Electron/28.2.3 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15"
]

function generateUUID() {
  const chars = '0123456789abcdef';
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len) => {
      let segment = '';
      for (let i = 0; i < len; i++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      return segment;
    })
    .join('-');
}

// image > base64 (better security, I guess?)
async function fetchImageAsBase64(contentUrl, filePath, refererUrl) {
  if (!filePath || !contentUrl) return null;

  try {
    // image url
    const baseUrl = contentUrl.replace(/\/$/, '');
    const path = filePath.startsWith('/') ? filePath : '/' + filePath;
    const imageUrl = `${baseUrl}${path}`;

    // fetch image
    const randomUA = user_agent_list[Math.floor(Math.random() * user_agent_list.length)];
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': randomUA,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        authorization: '',
        Connection: 'keep-alive',
        Referer: refererUrl,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        TE: 'trailers',
      },
    });

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageUrl} - ${imageResponse.status}`);
      return null;
    }

    // get image as array buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    const bytes = new Uint8Array(imageBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk);
    }
    const base64 = btoa(binary);

    // get content type
    let contentType = imageResponse.headers.get('Content-Type');
    if (!contentType) {
      const ext = filePath.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      };
      contentType = mimeTypes[ext] || 'image/png';
    }

    // return as data URI
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error fetching image ${filePath}:`, error);
    return null;
  }
}

// build backend image URL from contentUrl and file path
function buildImageUrl(contentUrl, filePath) {
  if (!filePath) return null;

  // get the content id
  let contentId = '';
  if (contentUrl) {
    const match = contentUrl.match(/\/([^\/]+)$/);
    if (match) {
      contentId = match[1];
    }
  }

  if (!contentId) return filePath;

  // some error handling
  const path = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  return `/image?path=${encodeURIComponent(path)}&contentId=${encodeURIComponent(contentId)}`;
}

function patchContent(data, workerUrl) {
  if (!data || !data.integration || !data.integration.contents) return data;

  const contentId = Object.keys(data.integration.contents)[0];
  const content = data.integration.contents[contentId];
  if (!content.jsonContent) return data;

  let json;
  try {
    json = JSON.parse(content.jsonContent);
  } catch (e) {
    return data;
  }

  function overwriteProtection(obj) {
    if (!obj || typeof obj !== 'object') return;

    // Force enable solutions and retry
    if (obj.enableSolutionsButton !== undefined) obj.enableSolutionsButton = true;
    if (obj.enableRetry !== undefined) obj.enableRetry = true;
    if (obj.enableCheckButton !== undefined) obj.enableCheckButton = true;
    if (obj.showSolutionsRequiresInput !== undefined) obj.showSolutionsRequiresInput = false;
    if (obj.checkButton !== undefined) obj.checkButton = true;
    if (obj.disableShowSolutions !== undefined) obj.disableShowSolutions = false;
    if (obj.showSolution !== undefined) obj.showSolution = true;

    if (obj.interactiveVideo && obj.interactiveVideo.summary && obj.interactiveVideo.summary.task) {
      overwriteProtection(obj.interactiveVideo.summary.task);
    }

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object') {
        overwriteProtection(obj[key]);
      }
    });
  }

  overwriteProtection(json);

  if (json.randomQuestions !== undefined) json.randomQuestions = false;
  if (json.poolSize !== undefined) delete json.poolSize;
  if (json.disableBackwardsNavigation !== undefined) {
    json.disableBackwardsNavigation = false;
  }

  if (workerUrl) {
    json = rewriteAllUrls(json, workerUrl);
  }

  content.jsonContent = JSON.stringify(json);
  return data;
}

function proxyUrl(url, workerUrl) {
  if (!url) return url;
  if (url.startsWith('https://')) {
    const p = url.replace('https://', '');
    return `${workerUrl.origin}/proxy/https/${p}`;
  }
  if (url.startsWith('http://')) {
    const p = url.replace('http://', '');
    return `${workerUrl.origin}/proxy/http/${p}`;
  }
  if (url.startsWith('//')) {
    return `${workerUrl.origin}/proxy/https/${url.slice(2)}`;
  }
  return url;
}

function rewriteAllUrls(obj, workerUrl) {
  if (typeof obj === 'string') {
    if ((obj.startsWith('http') || obj.startsWith('//')) &&
      (obj.includes('lms360.vn') || obj.includes('h5p.lms360.vn'))) {
      return proxyUrl(obj.startsWith('//') ? 'https:' + obj : obj, workerUrl);
    }
    return obj;
  }
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(v => rewriteAllUrls(v, workerUrl));

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    newObj[key] = rewriteAllUrls(value, workerUrl);
  }
  return newObj;
}

function process_h5p_questions(json, options = {}) {
  const lib = (json.library || json.__containerLibrary || '').toString();
  const params = json.params || json;
  let results = [];

  // get content url from options, json, param
  const contentUrl = options.contentUrl || json.__contentUrl || params.__contentUrl || '';

  const addResult = (text, duration = options.duration) => {
    if (!text) return;
    const cleanText = text
      .replace(/<(img|iframe)[^>]*>/gi, 'MEDIA_PLACEHOLDER')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    if (cleanText.length > 0) {
      results.push({ text, duration });
    }
  };

  const getMediaImage = (p) => {
    const file = p.media?.type?.params?.file || p.file;
    if (file?.path) {
      const url = buildImageUrl(contentUrl, file.path);
      const alt = p.media?.type?.params?.alt || p.alt || 'Hình ảnh';
      return `<div class="image-block"><img src="${url}" alt="${alt}" style="max-width:100%;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);margin-bottom:10px;"></div>`;
    }
    return '';
  };

  // the most important part ;)
  if (lib.startsWith('H5P.MultiChoice') || lib.startsWith('H5P.SimpleMultiChoice')) {
    const qText = (params.question || 'Câu hỏi').replace(/<\/?p>/g, '').trim();
    const image = getMediaImage(params);
    const opts = (params.answers || params.alternatives || [])
      .map((ans) => `<li class="${ans.correct ? 'highlight' : ''}">${(ans.text || ans).replace(/<\/?p>/g, '').trim()}</li>`)
      .join('');
    if (opts) addResult(`${image}${qText}<ul>${opts}</ul>`);
  } else if (lib.startsWith('H5P.SingleChoiceSet')) {
    (params.choices || []).forEach((c) => {
      const opts = (c.answers || [])
        .map((a, i) => `<li class="${i === 0 ? 'highlight' : ''}">${a.replace(/<\/?p>/g, '').trim()}</li>`)
        .join('');
      if (opts) addResult(`${(c.question || '').replace(/<\/?p>/g, '').trim()}<ul>${opts}</ul>`);
    });
  } else if (lib.startsWith('H5P.Blanks')) {
    const mediaImage = getMediaImage(params);
    const titleHtml = params.text ? `<strong>${params.text.replace(/<\/?p>/g, '').trim()}</strong><br><br>` : '';
    const title = mediaImage + titleHtml;
    (params.questions || json.questions || []).forEach((q) =>
      addResult(
        title +
        q
          .replace(/<\/p>/gi, '<br>')
          .replace(/<p>/gi, '')
          .replace(/<(?!br\s*\/?>)[^>]+>/gi, '')
          .replace(/\*(.*?)\*/g, (m, c) =>
            c
              .split('/')
              .map((p) => `<span class="highlight">${p.trim()}</span>`)
              .join(' / '),
          )
          .trim(),
      ),
    );
  } else if (lib.startsWith('H5P.TrueFalse')) {
    const qText = (params.question || 'Đúng/Sai').replace(/<\/?p>/g, '');
    const labels = [params.l10n?.trueText || 'Đúng', params.l10n?.falseText || 'Sai'];
    const correct = params.correct === 'true' ? labels[0] : labels[1];
    addResult(
      `${getMediaImage(params)}${qText}<ul><li class="${params.correct === 'true' ? 'highlight' : ''}">${labels[0]}</li><li class="${params.correct === 'false' ? 'highlight' : ''}">${labels[1]}</li></ul>`,
    );
  } else if (lib.startsWith('H5P.DragText')) {
    let t = (params.textField || '')
      .split(/\r?\n|\\n/)
      .map((l) =>
        l
          .replace(/‾\t/g, '')
          .trim()
          .replace(/<(?!br\s*\/?>)[^>]+>/gi, '')
          .replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>'),
      )
      .join('<br>');
    if (params.distractors)
      t += `<br><em>(Từ không có trong đáp án: ${params.distractors
        .match(/\*(.*?)\*/g)
        ?.map((d) => d.replace(/\*/g, ''))
        .join(', ')})</em>`;
    addResult(t);
  } else if (lib.startsWith('H5P.MarkTheWords')) {
    addResult(
      `<p>${params.taskDescription?.replace(/<\/?p>/g, '').trim() || ''}</p><p>${(params.textField || '')
        .replace(/<\/?p>/g, '')
        .replace(/<(?!br\s*\/?>)[^>]+>/gi, '')
        .replace(/\*(.+?)\*/g, '<span class="highlight">$1</span>')}</p>`,
    );
  } else if (lib.startsWith('H5P.Essay') || lib.startsWith('H5P.FreeTextQuestion')) {
    let t = (params.taskDescription || params.question || 'Tự luận').replace(/<\/?p>/g, '').trim();
    const ks = (params.keywords || []).map((k) => (k.keyword || '').replace(/•/g, '<br>•').trim()).filter((k) => k.length > 0);
    if (ks.length) t += `<br><br><em><strong>Gợi ý:</strong><em><div style="margin-left:20px;">${ks.join('<br><br>')}</div>`;
    addResult(`${t}<br><em>(Câu hỏi tự luận không có đáp án sẵn)</em>`);
  } else if (lib.startsWith('H5P.Summary')) {
    const groups = (params.summaries || [])
      .map((g) => {
        const listItems = (g.summary || [])
          .map((s, i) => `<li class="${i === 0 ? 'highlight' : ''}">${s.replace(/<\/?p>/g, '').trim()}</li>`)
          .join('');
        return listItems ? `<ul>${listItems}</ul>` : '';
      })
      .filter((html) => html !== '')
      .join('');
    if (groups) addResult(`<strong>${(params.intro || '').replace(/<\/?p>/g, '')}</strong><br>${groups}`);
  } else if (lib.startsWith('H5P.SortParagraphs')) {
    addResult(
      `<strong>${params.taskDescription?.replace(/<\/?p>/g, '') || 'Sắp xếp:'}</strong><ul>${(params.paragraphs || []).map((p) => `<li>${p.replace(/<\/?p>/g, '').trim()}</li>`).join('')}</ul>`,
    );
  } else if (lib.startsWith('H5P.Crossword')) {
    const build = (l, t) =>
      l.length ? `<h4>${t}:</h4><ul>${l.map((w) => `<li>${w.clue} <span class="highlight">${w.answer}</span></li>`).join('')}</ul>` : '';
    addResult(
      `<div class="crossword-container">${build(
        params.words.filter((w) => w.orientation === 'across'),
        'Ngang',
      )}${build(
        params.words.filter((w) => w.orientation === 'down'),
        'Dọc',
      )}</div>`,
    );
  } else if (lib.startsWith('H5P.FindTheWords')) {
    addResult(
      `<strong>${params.taskDescription?.replace(/<\/?p>/g, '').trim() || 'Tìm từ:'}</strong><ul>${(params.wordList || '')
        .split(',')
        .map((w) => `<li class="highlight">${w.trim()}</li>`)
        .join('')}</ul>`,
    );
  } else if (lib.startsWith('H5P.DragQuestion')) {
    const qTask = params.question?.task || {};
    const elements = qTask.elements || [];
    const dropZones = qTask.dropZones || [];
    const mapping = dropZones
      .map((dz, idx) => {
        const label = (dz.label || '').replace(/<\/?p>/g, '').trim() || `Vùng ${idx + 1}`;
        const correctIndices = dz.correctElements || [];
        const items = correctIndices
          .map((i) => {
            const el = elements[i];
            if (!el) return '';
            const type = el.type || {};
            if (type.library?.startsWith('H5P.AdvancedText')) {
              return type.params?.text?.replace(/<\/?p>/g, '').trim();
            } else if (type.params?.file?.path) {
              return `[Ảnh: ${type.params.alt || 'không có mô tả'}]`;
            }
            return '';
          })
          .filter(Boolean);
        return items.length ? `<li><strong>${label}:</strong> ${items.join(', ')}</li>` : '';
      })
      .filter(Boolean)
      .join('');
    addResult(`<strong>Kéo các mục vào đúng vị trí:</strong><ul>${mapping}</ul>`);
  }

  // handling for those stupid container
  const recurseOptions = { ...options, contentUrl };
  (params.interactiveVideo?.assets?.interactions || []).forEach(
    (i) => (results = results.concat(process_h5p_questions(i.action, { ...recurseOptions, duration: i.duration }))),
  );
  if (params.interactiveVideo?.summary?.task)
    results = results.concat(process_h5p_questions(params.interactiveVideo.summary.task, recurseOptions));
  const contents = params.content || params.questions || [];
  if (Array.isArray(contents)) contents.forEach((i) => (results = results.concat(process_h5p_questions(i.content || i, recurseOptions))));
  (params.presentation?.slides || []).forEach((s) =>
    (s.elements || []).forEach((e) => (results = results.concat(process_h5p_questions(e.action, recurseOptions)))),
  );
  (params.chapters || []).forEach((c) =>
    (c.params?.content || []).forEach((b) => (results = results.concat(process_h5p_questions(b.content, recurseOptions)))),
  );
  (params.questionnaireElements || []).forEach((e) => (results = results.concat(process_h5p_questions(e.library || e, recurseOptions))));

  // more error handling if lms360 decided to add new container
  if (results.length === 0 && params && typeof params === 'object') {
    Object.values(params).forEach((val) => {
      if (val && typeof val === 'object' && (val.library || val.params)) {
        results = results.concat(process_h5p_questions(val, recurseOptions));
      } else if (Array.isArray(val)) {
        val.forEach((item) => {
          if (item && typeof item === 'object' && (item.library || item.params)) {
            results = results.concat(process_h5p_questions(item, recurseOptions));
          }
        });
      }
    });
  }

  return results;
}

// This is what block you from using the backend :)

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const FEATURE_FLAGS = {
  ENABLE_CORS: false, // only allow requests from lms360hack.pages.dev,
  //                      disable it if you want to test from localhost or other origin
  ENABLE_RATE_LIMIT: false,
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function process_questions(data, refererUrl) {
  try {
    let jsonContent;
    let outerLib = '';
    let contentUrl = '';

    if (data.integration && data.integration.contents) {
      const contentId = Object.keys(data.integration.contents)[0];
      const contentObj = data.integration.contents[contentId];
      jsonContent = JSON.parse(contentObj.jsonContent);

      outerLib = contentObj.library || contentObj.metadata?.contentType || '';
      jsonContent.__containerLibrary = outerLib;
      contentUrl = contentObj.contentUrl || '';
    } else {
      jsonContent = data;
      outerLib = jsonContent.library || '';
      jsonContent.__containerLibrary = outerLib;
      contentUrl = data.contentUrl || '';
    }

    jsonContent.__contentUrl = contentUrl;

    const imageReplacements = new Map();

    let results = process_h5p_questions(jsonContent).map((r, i) => ({ ...r, index: i + 1 }));

    results.sort((a, b) => {
      const timeA = a.duration?.from ?? Infinity;
      const timeB = b.duration?.from ?? Infinity;
      return timeA - timeB;
    });

    // get da image url
    const imageUrlPattern = /src="([^"]+)"/g;
    const imagePaths = new Set();

    for (const result of results) {
      let match;
      while ((match = imageUrlPattern.exec(result.text)) !== null) {
        const imageUrl = match[1];
        // get file path
        let filePath = null;
        if (imageUrl.startsWith('/image')) {
          try {
            const url = new URL(imageUrl, 'http://idkwtfisthis'); // error handling
            filePath = url.searchParams.get('path');
          } catch (e) { }
        } else if (imageUrl.includes('h5p.lms360.vn')) {
          const urlMatch = imageUrl.match(/h5p\.lms360\.vn\/[^\/]+\/(.+)$/);
          if (urlMatch) {
            filePath = urlMatch[1];
          }
        }

        if (filePath) {
          imagePaths.add(filePath);
          imageReplacements.set(imageUrl, filePath);
        }
      }
    }

    // parallel image fetcher (very efficient, I think?)
    const imagePromises = Array.from(imagePaths).map(async (filePath) => {
      const base64 = await fetchImageAsBase64(contentUrl, filePath, refererUrl);
      return { filePath, base64 };
    });

    const imageResults = await Promise.all(imagePromises);
    const base64Map = new Map();
    for (const { filePath, base64 } of imageResults) {
      if (base64) {
        base64Map.set(filePath, base64);
      }
    }

    for (const result of results) {
      for (const [imageUrl, filePath] of imageReplacements.entries()) {
        const base64 = base64Map.get(filePath);
        if (base64) {
          const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          result.text = result.text.replace(new RegExp(escapedUrl, 'g'), base64);
        }
      }
    }

    let actualQuestionCount = 0;
    if (typeof jsonContent.poolSize === 'number' && !isNaN(jsonContent.poolSize)) {
      actualQuestionCount = jsonContent.poolSize;
    } else if (Array.isArray(jsonContent.questions)) {
      actualQuestionCount = jsonContent.questions.length;
    } else {
      actualQuestionCount = results.length;
    }

    return {
      success: results.length > 0,
      count: results.length,
      actualQuestionCount,
      questions: results,
    };
  } catch (err) {
    console.error('Lỗi khi phân tích nội dung:', err);
    return {
      success: false,
      error: 'Link không hợp lệ hoặc không đúng định dạng.',
      count: 0,
      actualQuestionCount: 0,
      questions: [],
    };
  }
}

export default {
  async fetch(request, env, ctx) {
    const allowedOrigin = 'https://lms360hack.pages.dev';
    const origin = request.headers.get('Origin');

    if (FEATURE_FLAGS.ENABLE_CORS) {
      if (origin !== allowedOrigin) {
        return new Response('Ur not allowed!', { status: 403 });
      }
    }

    if (request.method === 'OPTIONS') {
      const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'GET') {
      return new Response('Hmm', { status: 405 });
    }

    try {
      const url = new URL(request.url);
      const randomUA = user_agent_list[Math.floor(Math.random() * user_agent_list.length)];

      if (url.pathname.startsWith('/proxy/')) {
        const match = url.pathname.match(/^\/proxy\/(https|http)\/(.+)$/);
        if (match) {
          const protocol = match[1];
          const remaining = match[2];
          let targetUrl = `${protocol}://${remaining}`;
          if (url.search) targetUrl += url.search;

          const assetResponse = await fetch(targetUrl, {
            headers: { 'User-Agent': randomUA, 'Referer': 'https://lms360.vn/' }
          });

          const headers = new Headers(assetResponse.headers);
          headers.set('Access-Control-Allow-Origin', '*');

          return new Response(assetResponse.body, {
            status: assetResponse.status,
            headers: headers
          });
        }
      }

      if (url.pathname.includes('.') &&
        (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.woff') || url.pathname.endsWith('.woff2') ||
          url.pathname.endsWith('.ttf') || url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg'))) {

        let targetUrl = '';
        if (url.pathname.startsWith('/core/') || url.pathname.startsWith('/libraries/')) {
          targetUrl = `https://cdnc.lms360.vn/elearning/p24/h5p${url.pathname}${url.search}`;
        } else {
          targetUrl = `https://cdnc.lms360.vn/elearning/p24/h5p/core/styles${url.pathname}${url.search}`;
        }

        const assetResponse = await fetch(targetUrl, {
          headers: { 'User-Agent': randomUA, 'Referer': 'https://lms360.vn/' }
        });

        if (assetResponse.ok) {
          const headers = new Headers(assetResponse.headers);
          headers.set('Access-Control-Allow-Origin', '*');
          return new Response(assetResponse.body, { headers });
        }
      }

      const contentId = url.searchParams.get('h5p_id');
      if (contentId) {
        const idPattern = /^[0-9a-f]{24}$/i;
        if (!idPattern.test(contentId)) {
          return new Response('Wrong!', { status: 400 });
        }

        if (FEATURE_FLAGS.ENABLE_RATE_LIMIT) {
          const key = `download:${contentId}`;
          const { success } = await env.ANTI_DDOS.limit({ key });
          if (!success) {
            const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
            return new Response('Hey!', {
              status: 429,
              headers: {
                'Retry-After': '60',
                'Access-Control-Allow-Origin': corsOrigin,
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            });
          }
        }

        const uuidP = generateUUID();
        const uuidCs = generateUUID();
        const refererUrl = `https://lms360.vn/xem-video?p=${uuidP}&c=${contentId}&cs=${uuidCs}&m=2&pa=1&sch=2`;

        if (url.pathname === '/player') {
          const lms360Url = `https://lms360.vn/h5p/${encodeURIComponent(contentId)}/play`;
          const response = await fetch(lms360Url, {
            headers: {
              'User-Agent': randomUA,
              'Referer': refererUrl
            }
          });
          if (!response.ok) return new Response('Failed to fetch player data', { status: response.status });

          let data = await response.json();
          data = patchContent(data, url);
          data = rewriteAllUrls(data, url);

          const styles = [
            ...(data.core?.styles || data.integration?.core?.styles || []),
            ...(data.integration?.styles || []),
            ...(data.integration?.contents ? Object.values(data.integration.contents).flatMap(c => c.styles || []) : [])
          ];
          const uniqueStyles = [...new Set(styles)];

          const scripts = [
            ...(data.core?.scripts || data.integration?.core?.scripts || []),
            ...(data.integration?.scripts || []),
            ...(data.integration?.contents ? Object.values(data.integration.contents).flatMap(c => c.scripts || []) : [])
          ];
          const uniqueScripts = [...new Set(scripts)];

          const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>H5P Player Proxy</title>
    ${uniqueStyles.map(s => `<link rel="stylesheet" href="${s}">`).join('\n')}
    <style>
        body { margin: 0; padding: 5px; box-sizing: border-box; background: #FFFFFF; min-height: 100vh; overflow: hidden !important; }
        html { background: #FFFFFF; margin: 0; padding: 0; overflow: hidden !important; }
    </style>
</head>
<body>
    <div class="h5p-content" data-content-id="${contentId}"></div>
    <script>
        window.H5PIntegration = ${JSON.stringify({
            ...data.integration,
            core: data.core || data.integration?.core,
            l10n: data.l10n || data.integration?.l10n
          })};
    </script>
    ${uniqueScripts.map(s => `<script src="${s}"></script>`).join('\n')}
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            H5P.externalDispatcher.on('initialized', () => {
                console.log('H5P Initialized, triggering solve...');
                // Run once after a brief delay to ensure DOM is ready.
                // We removed setInterval to avoid breaking slide/book jumping behavior.
                setTimeout(revealAnswers, 500);
            });

            function revealAnswers() {
                const instances = H5P.instances || [];
                const visited = new Set([window, document, H5P]);

                function isElementVisible(el) {
                    if (!el || !(el instanceof Element)) return true; // Can't trace DOM
                    if (el.offsetParent === null) return false;
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                }

                function reveal(obj) {
                    if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
                    visited.add(obj);

                    // For content types that have multiple slides/pages/steps (Presentation, Book, etc),
                    // calling .showSolutions() on hidden slides forces the container to auto-jump.
                    // To prevent jumping, we must check if the object's wrapper DOM element is visible.
                    let isCurrentlyVisible = true;
                    if (obj.wrapper) isCurrentlyVisible = isElementVisible(obj.wrapper[0] || obj.wrapper);
                    else if (obj.$wrapper) isCurrentlyVisible = isElementVisible(obj.$wrapper[0]);
                    else if (obj.$container) isCurrentlyVisible = isElementVisible(obj.$container[0]);

                    if (isCurrentlyVisible && typeof obj.showSolutions === 'function' && !obj.__hacked_solution) {
                        try { obj.showSolutions(); obj.__hacked_solution = true; } catch (e) {}
                    }

                    if (isCurrentlyVisible && obj.libraryInfo?.machineName && obj.libraryInfo.machineName.includes('H5P.Essay') && obj.params && obj.params.keywords && !obj.__hacked_essay) {
                        try {
                            const keywords = obj.params.keywords.map(k => k.keyword).filter(k => !!k).join('; ');
                            if (keywords && obj.inputField) {
                                if (typeof obj.inputField.setText === 'function') obj.inputField.setText(keywords);
                                else if (obj.inputField.$input) obj.inputField.$input.val(keywords);
                                obj.__hacked_essay = true;
                            }
                        } catch (e) {}
                    }

                    if (typeof obj.getQuestions === 'function') {
                        try {
                            const qs = obj.getQuestions();
                            if (Array.isArray(qs)) qs.forEach(c => reveal(c));
                        } catch (e) {}
                    }

                    for (const key in obj) {
                        try {
                            const val = obj[key];
                            if (!val || typeof val !== 'object') continue;
                            if (val instanceof Element || (val && val.jquery)) continue;
                            if (key === 'parent' || key === 'parentVideo') continue;
                            reveal(val);
                        } catch (e) {}
                    }
                }

                instances.forEach(i => reveal(i));

                try {
                    const buttons = document.querySelectorAll('.h5p-question-check-answer:not([disabled]):not([data-hacked]), .h5p-actions .h5p-button.h5p-show-solutions:not([disabled]):not([data-hacked]), .h5p-joubelui-button[aria-label="Check"]:not([data-hacked])');
                    buttons.forEach(b => {
                        if (b.offsetParent !== null) {
                            b.click();
                            b.setAttribute('data-hacked', 'true');
                        }
                    });
                } catch(e) {}
            }
            
            function sendHeight() {

                let bestHeight = 0;
                
                const h5pContainer = document.querySelector('.h5p-container');
                if (h5pContainer) {
                    bestHeight = Math.max(bestHeight, h5pContainer.scrollHeight, h5pContainer.getBoundingClientRect().height);
                }
                
                const h5pContent = document.querySelector('.h5p-content');
                if (h5pContent) {
                    bestHeight = Math.max(bestHeight, h5pContent.scrollHeight, h5pContent.getBoundingClientRect().height);
                }

                if (bestHeight > 0) {
                    window.parent.postMessage({ type: 'h5p-resize', height: bestHeight + 40 }, '*');
                }
            }
            
            const ro = new ResizeObserver(sendHeight);
            ro.observe(document.body);
            
            setInterval(sendHeight, 1000);
            
            if (H5P && H5P.externalDispatcher) {
                H5P.externalDispatcher.on('resize', sendHeight);
            }
        });
    </script>
</body>
</html>`;
          return new Response(html, { headers: { 'Content-Type': 'text/html' } });
        }

        try {
          const downloadUrl = `https://lms360.vn/h5p/download/${contentId}`;
          const fileResponse = await fetch(downloadUrl, {
            headers: {
              'User-Agent': randomUA,
              Accept: '*/*',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              Connection: 'keep-alive',
              Origin: 'https://lms360.vn',
              Referer: 'https://lms360.vn/',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin',
              TE: 'trailers',
            },
          });

          if (!fileResponse.ok) {
            const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
            return new Response(
              JSON.stringify({
                success: false,
                error: `Wha!: ${fileResponse.status}`,
              }),
              {
                status: fileResponse.status,
                headers: {
                  'Access-Control-Allow-Origin': corsOrigin,
                  'Content-Type': 'application/json',
                  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
                  'X-Frame-Options': 'DENY',
                  'X-Content-Type-Options': 'nosniff',
                  'Referrer-Policy': 'strict-origin-when-cross-origin',
                  'Permissions-Policy': 'interest-cohort=()',
                  'Content-Security-Policy': "default-src 'self';",
                },
              },
            );
          }

          const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';

          return new Response(fileResponse.body, {
            headers: {
              'Access-Control-Allow-Origin': corsOrigin,
              'Content-Type': 'application/zip',
              'Content-Disposition': `attachment; filename="h5p-content-${contentId}.h5p"`,
              'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
              'X-Frame-Options': 'DENY',
              'X-Content-Type-Options': 'nosniff',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              'Permissions-Policy': 'interest-cohort=()',
              'Content-Security-Policy': "default-src 'self';",
            },
          });
        } catch (error) {
          console.error('Uh oh!', error);
          const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message,
            }),
            {
              status: 500,
              headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Content-Type': 'application/json',
                'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'interest-cohort=()',
                'Content-Security-Policy': "default-src 'self';",
              },
            },
          );
        }
        return new Response(
          JSON.stringify({
            success: false,
            error: 'My server is cooked!', // Please dont happen
          }),
          {
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': allowedOrigin,
              'Content-Type': 'application/json',
            },
          },
        );
      }

      if (url.pathname === '/') {
        const questionId = url.searchParams.get('id');
        const idPattern = /^[0-9a-f]{24}$/i;
        if (!questionId || !idPattern.test(questionId)) {
          return new Response('Eh?', { status: 400 });
        }

        if (FEATURE_FLAGS.ENABLE_RATE_LIMIT) {
          const key = questionId;
          const { success } = await env.ANTI_DDOS.limit({ key });
          if (!success) {
            const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
            return new Response('What?', {
              status: 429,
              headers: {
                'Retry-After': '60',
                'Access-Control-Allow-Origin': corsOrigin,
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            });
          }
        }

        // UUID format (as hex code):xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        // Who created this???
        const uuidP = generateUUID();
        const uuidCs = generateUUID();
        const refererUrl = `https://lms360.vn/xem-video?p=${uuidP}&c=${questionId}&cs=${uuidCs}&m=2&pa=1&sch=2`;

        if (url.pathname === '/image') {
          const imagePath = url.searchParams.get('path');
          const contentId = url.searchParams.get('contentId');

          if (!imagePath || !contentId) {
            const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
            return new Response('Uwgha!', {
              status: 400,
              headers: {
                'Access-Control-Allow-Origin': corsOrigin,
              },
            });
          }

          const imageUrl = `https://h5p.lms360.vn/${contentId}/${imagePath}`;

          try {
            const imageResponse = await fetch(imageUrl, {
              headers: {
                'User-Agent': randomUA,
                Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                authorization: '',
                Connection: 'keep-alive',
                Referer: refererUrl,
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                TE: 'trailers',
              },
            });

            if (!imageResponse.ok) {
              const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
              return new Response('where is it?', {
                status: 404,
                headers: {
                  'Access-Control-Allow-Origin': corsOrigin,
                },
              });
            }

            const imageBuffer = await imageResponse.arrayBuffer();

            const bytes = new Uint8Array(imageBuffer);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
              binary += String.fromCharCode.apply(null, chunk);
            }
            const base64 = btoa(binary);

            let contentType = imageResponse.headers.get('Content-Type');
            if (!contentType) {
              const ext = imagePath.split('.').pop()?.toLowerCase();
              const mimeTypes = {
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                gif: 'image/gif',
                webp: 'image/webp',
                svg: 'image/svg+xml',
              };
              contentType = mimeTypes[ext] || 'image/png';
            }

            const dataUri = `data:${contentType};base64,${base64}`;

            const headers = new Headers();
            const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
            headers.set('Access-Control-Allow-Origin', corsOrigin);
            headers.set('Access-Control-Allow-Methods', 'GET');
            headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            headers.set('Content-Type', 'application/json');
            headers.set('Cache-Control', 'public, max-age=31536000');

            return new Response(JSON.stringify({ dataUri }), { headers });
          } catch (error) {
            console.error('err', error);
            const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
            return new Response(JSON.stringify({ error: 'errr' }), {
              status: 500,
              headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Content-Type': 'application/json',
              },
            });
          }
        }

        const lms360Url = `https://lms360.vn/h5p/${encodeURIComponent(questionId)}/play`;
        const response = await fetch(lms360Url, {
          headers: {
            'User-Agent': randomUA,
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            authorization: '',
            Connection: 'keep-alive',
            Referer: refererUrl,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            TE: 'trailers',
          },
        });

        if (!response.ok) {
          const headers = new Headers();
          headers.set('Content-Type', 'application/json');
          const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
          headers.set('Access-Control-Allow-Origin', corsOrigin);
          headers.set('Access-Control-Allow-Methods', 'GET');
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
          headers.set('X-Frame-Options', 'DENY');
          headers.set('X-Content-Type-Options', 'nosniff');
          headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          headers.set('Permissions-Policy', 'interest-cohort=()');
          headers.set('Content-Security-Policy', "default-src 'self';");

          return new Response(
            JSON.stringify({
              success: false,
              error: `whoops: ${response.status} ${response.statusText}`,
              count: 0,
              actualQuestionCount: 0,
              questions: [],
            }),
            {
              status: response.status,
              headers,
            },
          );
        }

        const data = await response.json();
        const processed = await process_questions(data, refererUrl);

        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
        headers.set('Access-Control-Allow-Origin', corsOrigin);
        headers.set('Access-Control-Allow-Methods', 'GET');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        headers.set('X-Frame-Options', 'DENY');
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        headers.set('Permissions-Policy', 'interest-cohort=()');
        headers.set('Content-Security-Policy', "default-src 'self';");

        return new Response(JSON.stringify(processed), {
          headers,
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Nope:', error);
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      const corsOrigin = FEATURE_FLAGS.ENABLE_CORS ? allowedOrigin : origin || '*';
      headers.set('Access-Control-Allow-Origin', corsOrigin);
      headers.set('Access-Control-Allow-Methods', 'GET');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      headers.set('Permissions-Policy', 'interest-cohort=()');
      headers.set('Content-Security-Policy', "default-src 'self';");

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'My server is cooked!',
          count: 0,
          actualQuestionCount: 0,
          questions: [],
        }),
        {
          status: 500,
          headers,
        },
      );
    }
  },
};
