const fs = require('fs');
const path = require('path');

async function run() {
  const configPath = path.join(process.env.LOCALAPPDATA, 'Syncthing', 'config.xml');
  if (!fs.existsSync(configPath)) {
    console.log('Syncthing config not found at', configPath);
    return;
  }
  const xml = fs.readFileSync(configPath, 'utf8');
  const match = xml.match(/<apikey>(.*?)<\/apikey>/);
  if (!match) throw new Error('API key not found');
  const apiKey = match[1];
  
  const headers = { 'X-API-Key': apiKey, 'Content-Type': 'application/json' };
  
  // Get current config
  let res = await fetch('http://localhost:8384/rest/config', { headers });
  if (!res.ok) throw new Error('Failed to get config ' + res.status);
  let config = await res.json();
  
  const deviceId = 'CJ6KV5O-TR3QUNH-Y2XMC3Y-BNJYN3F-E25UOO2-73W7GLA-K5OV6IO-IE25AQQ';
  
  // 1. Add Device
  const deviceExists = config.devices.find(d => d.deviceID === deviceId);
  if (!deviceExists) {
    config.devices.push({
      deviceID: deviceId,
      name: 'Notebook Gemini',
      addresses: ['dynamic'],
      compression: 'metadata',
      certName: '',
      introducer: false,
      skipIntroductionRemovals: false,
      introducedBy: '',
      paused: false,
      allowedNetworks: [],
      maxSendKbps: 0,
      maxRecvKbps: 0,
      maxRequestKiB: 0,
      untrusted: false,
      remoteGUIPort: 0
    });
    console.log('=> Notebook device added to config.');
  } else {
    console.log('=> Notebook device already exists.');
  }
  
  // 2. Add Folder KAIROS
  const folderPath = 'C:\\Users\\GABS\\Documents\\My KAIROS';
  let folder = config.folders.find(f => f.path === folderPath || f.id === 'kairos-core');
  
  if (!folder) {
    folder = {
      id: 'kairos-core',
      label: 'KAIROS Core',
      filesystemType: 'basic',
      path: folderPath,
      type: 'sendreceive',
      devices: [{ deviceID: config.devices[0].deviceID }], // Add local device
      rescanIntervalS: 3600,
      fsWatcherEnabled: true,
      fsWatcherDelayS: 10,
      ignorePerms: false,
      autoNormalize: true
    };
    config.folders.push(folder);
    console.log('=> KAIROS folder created in config.');
  }
  
  // Share folder with the new device
  const deviceInFolder = folder.devices.find(d => d.deviceID === deviceId);
  if (!deviceInFolder) {
    folder.devices.push({ deviceID: deviceId, introducedBy: '' });
    console.log('=> Folder shared with Notebook.');
  } else {
    console.log('=> Folder already shared with Notebook.');
  }
  
  // POST updated config
  res = await fetch('http://localhost:8384/rest/config', {
    method: 'PUT',
    headers,
    body: JSON.stringify(config)
  });
  
  if (res.ok) {
    console.log('=> Syncthing configuration updated successfully on localhost:8384!');
  } else {
    console.error('=> Failed to update config:', await res.text());
  }
}

run().catch(console.error);
