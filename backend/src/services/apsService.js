import axios from 'axios';
import { env } from '../config/env.js';

const APS_BASE = 'https://developer.api.autodesk.com';
const scopes = ['bucket:create', 'bucket:read', 'data:read', 'data:write', 'data:create', 'viewables:read'];

function assertApsConfig() {
  if (!env.apsClientId || !env.apsClientSecret || !env.apsBucketKey) {
    throw new Error('Configure APS_CLIENT_ID, APS_CLIENT_SECRET e APS_BUCKET_KEY.');
  }
}

export function toBase64Urn(objectId) {
  return Buffer.from(objectId).toString('base64').replace(/=/g, '');
}

export async function getInternalToken() {
  assertApsConfig();
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: scopes.join(' ')
  });

  const { data } = await axios.post(`${APS_BASE}/authentication/v2/token`, body, {
    auth: { username: env.apsClientId, password: env.apsClientSecret },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return data;
}

export async function getViewerToken() {
  const token = await getInternalToken();
  return { access_token: token.access_token, expires_in: token.expires_in };
}

export async function ensureBucket(accessToken) {
  try {
    await axios.get(`${APS_BASE}/oss/v2/buckets/${env.apsBucketKey}/details`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch (error) {
    if (error.response?.status !== 404) throw error;
    await axios.post(
      `${APS_BASE}/oss/v2/buckets`,
      { bucketKey: env.apsBucketKey, policyKey: 'transient' },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-ads-region': env.apsRegion
        }
      }
    );
  }
}

export async function uploadObject(file) {
  const { access_token: accessToken } = await getInternalToken();
  await ensureBucket(accessToken);

  const objectKey = `${Date.now()}-${file.originalname}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const encodedObjectKey = encodeURIComponent(objectKey);

  const { data: signed } = await axios.get(
    `${APS_BASE}/oss/v2/buckets/${env.apsBucketKey}/objects/${encodedObjectKey}/signeds3upload`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  await axios.put(signed.urls[0], file.buffer, {
    headers: { 'Content-Type': file.mimetype || 'application/octet-stream' },
    maxBodyLength: Infinity
  });

  const { data: complete } = await axios.post(
    `${APS_BASE}/oss/v2/buckets/${env.apsBucketKey}/objects/${encodedObjectKey}/signeds3upload`,
    { uploadKey: signed.uploadKey },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  const objectId = complete.objectId;
  return { objectKey, objectId, urn: toBase64Urn(objectId), accessToken };
}

export async function translateObject(urn) {
  const { access_token: accessToken } = await getInternalToken();
  await axios.post(
    `${APS_BASE}/modelderivative/v2/designdata/job`,
    {
      input: { urn },
      output: { formats: [{ type: 'svf2', views: ['2d', '3d'] }] }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-ads-force': 'true'
      }
    }
  );
}

export async function getManifest(urn) {
  const { access_token: accessToken } = await getInternalToken();
  const { data } = await axios.get(`${APS_BASE}/modelderivative/v2/designdata/${urn}/manifest`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return data;
}
