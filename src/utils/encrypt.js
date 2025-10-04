import JSEncrypt from 'jsencrypt';

/**
 * RSA加密
 * @param {string} data - 需要加密的数据
 * @param {string} publicKey - RSA公钥
 * @returns {string} 加密后的数据
 */
export function rsaEncrypt(data, publicKey) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(data);
}
