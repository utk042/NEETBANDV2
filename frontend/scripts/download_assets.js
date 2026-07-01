import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS_DIR = path.resolve('src/assets');

const assetsToDownload = [
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAshHYALd64wkj-qVynXFZyaZBiJJG4ruLGN1KdkxjSdBXTYtGAgQXea9ZtyYQb1UBOmFSb1AzYymnc-Zpf4jUxk7uMqAU7kCMwyoT1dhc7Hs42vY90etqqz-Um_pQcuQASwC2qTbU09V_MnIs1crmW6q_7RbL6HrJwkW4J2tbBtAZxQgTM_xMjhvV1ah2uCu-dubU2-6nnKfyE6LkbVR_ZIMsB1L7aMuhCNxy3U77MtOBEjghlrIfiiPwS93AT3t0yLF3MRpbUDpo',
    filename: 'logo.png'
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZgg7AsizuEI2jpCxYFJq9QImJC3KmkYKlMUcg0ps20T7lRLNxx-i38dtpLJsFAxztGglWp1pfU-shMEHLu_TPDnrtQu6xyehFlkkNDLKnPxozJ09ju6_s0TwGCw1ovUz0Rj_yEzJlffdJQg1-MQ6ggEknujfP11L32fNwR-AMxfl8oEf4xMldGQ5MW8SkouXZYeL5xlPT08u0rm5zGL8ojUlFTmC3KnXdyC0SpQ5FDn6pCmFjbZKgWC7hso5fZifOswv1_3mdiIk',
    filename: 'mendelian_genetics_anthem.png'
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmuF3O2lSzk_gpJopb70tLi1mpcyEo4kRasoXYwOUpkdy580hNzTi4aLg7AuHlWNcYd465C38WSNh_EBB1HnBBvAtijHiaIHXY-FEpgkQ5Ltqy06p8XvxHQvGAiriKAQnOIGyXNrnUCx5wUzs5ba9T5B-HDfmqBDgo33eQV-Sr2hPcAkTz56GOJkj2eQnUSWu5fYFzyxmvyX1G0mbi59mccspEBt_vD7kgvSSmO5k9WSawkLGnjGXo7OSTKDep5LqrVF56rqLJpzc',
    filename: 'hero_bg.jpg'
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCwenewRjEmP5AawyPyDXzJYSHSXAx4kp4wDdhyovqCatduYl7E4G_6AKNlawsB2OFCYZYd3t4R6fwaXOFXlrAFUvgtyncTwt3JvWmV_V3k9nReXXr1pKk4hzEwXecNkwbkiPHuVDLV9vqRmY2WzH03K-NEqydaJpOjh7iM13mv2xeM1r3Y_hXBkE_U6IV8vF0A349YCUu9YqGML7ZMqm3865_LcufnyBr90Ca1QZRIwHcM-o7sP7LXjx8yipQMIPqXAQcNygvNQ8',
    filename: 'dna_replication.png'
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS71zPmry5BuJ5xfmfEWdvFWe-Q21-wlBU5K3o_PQxYVdl3ia-vSUkt82n50h6c7x-4juegY_AjoYMmDu_D6L_KJH47J8ij196qr1TLGV3gp7pQqvHR3BF3ul-Zj7fBYWGmA0Kk9OCUmJx-TMEoqIJswNxPjdTJfmwT_XAJ7thAop-_4VeosUG1xNbAs1UQRyw7d1DdPQdu0OIAo6iR6CkHXJRsSezr086MOBeqwd2KofIx_dWerYp7wQp1u31oJ0B3om_WqzZK4s',
    filename: 'dna_replication_thumbnail.png'
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-XdG7M3BTOR_80IOQas0cvrJaGJtzHZ60W1UDoPKtI3KLTcqKqTXd5yRXK6d6PSL0IioklakK1TqiWE1ZfrBZdMTpXxonWL2yGrK6-dwdiW4WVbopr5KeJryBk_B8axS83Eu__O77QivKy2JJ7fa2dZuEn29Vix9-CJ0xzkiRxzMDEy5p9ikzMVF6f-6czUHjY-F7d96zjmfKPhYNkn6-3EqBjw9-RbNIr0HCgk66swItgSTnuedNmhOoEW7lL_BnfepkLTMv9hs',
    filename: 'chromosomal_theory_flow.png'
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgHegmm_dD8I5d4T8bfwFVKGdmDuTAAba9XzjyL8JExAXYUzF90FRN8nI9paeisCUqWeVsgDyPUpPtfQDqhh_8aVsQIPWb1DQ1ZIeeRPHa7K3X8X1ES2_RMFuTvL2_oSJKAnYyHysaLt1NY9JIvVnwkFG9cwvrQVJlyW-egUvs0FbWIB7XtyCsm95U0qlNivofxQ1ohU1N1Xx8fkenRaF4bCWxt_wXi163nheF_y2HHJosE4l98rqktowIz6329NED_N5d8KZlBKY',
    filename: 'molecular_structure.png'
  }
];

// Ensure directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete local file on error
      reject(err);
    });
  });
};

const run = async () => {
  console.log('Starting assets download...');
  for (const asset of assetsToDownload) {
    const destPath = path.join(ASSETS_DIR, asset.filename);
    try {
      await downloadFile(asset.url, destPath);
    } catch (error) {
      console.error(`Error downloading ${asset.filename}:`, error.message);
    }
  }
  console.log('All assets processed.');
};

run();
