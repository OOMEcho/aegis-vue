import forge from 'node-forge';

/**
 * RSA加密 (OAEP with SHA-256)
 * @param {string} data - 需要加密的数据
 * @param {string} publicKey - RSA公钥 (Base64格式，非PEM)
 * @returns {string} 加密后的Base64数据
 */
export function rsaEncrypt(data, publicKey) {
  // 后端给的是纯 Base64，需要先转成 PEM 格式
  const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
  const pub = forge.pki.publicKeyFromPem(pemKey);
  const encrypted = pub.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() }
  });
  return forge.util.encode64(encrypted);
}
