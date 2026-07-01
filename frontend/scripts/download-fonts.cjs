const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../src/assets/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontsToDownload = [
  // Inter
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuOKfMZg.ttf',
    dest: 'Inter-300.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
    dest: 'Inter-400.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf',
    dest: 'Inter-500.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf',
    dest: 'Inter-600.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
    dest: 'Inter-700.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf',
    dest: 'Inter-800.ttf'
  },
  // Plus Jakarta Sans
  {
    url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NSg.ttf',
    dest: 'PlusJakartaSans-400.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_m07NSg.ttf',
    dest: 'PlusJakartaSans-500.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_d0nNSg.ttf',
    dest: 'PlusJakartaSans-600.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_TknNSg.ttf',
    dest: 'PlusJakartaSans-700.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KUnNSg.ttf',
    dest: 'PlusJakartaSans-800.ttf'
  },
  // Material Symbols Outlined
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHeem.ttf',
    dest: 'MaterialSymbolsOutlined-100.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDAvHOem.ttf',
    dest: 'MaterialSymbolsOutlined-200.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDDxHOem.ttf',
    dest: 'MaterialSymbolsOutlined-300.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOem.ttf',
    dest: 'MaterialSymbolsOutlined-400.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCdHOem.ttf',
    dest: 'MaterialSymbolsOutlined-500.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDBxG-em.ttf',
    dest: 'MaterialSymbolsOutlined-600.ttf'
  },
  {
    url: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v352/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDBIG-em.ttf',
    dest: 'MaterialSymbolsOutlined-700.ttf'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded: ${path.basename(destPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading fonts...');
  for (const item of fontsToDownload) {
    const destPath = path.join(fontsDir, item.dest);
    try {
      await downloadFile(item.url, destPath);
    } catch (err) {
      console.error(`Error downloading ${item.dest}:`, err.message);
    }
  }
  console.log('Fonts download completed.');
}

run();
