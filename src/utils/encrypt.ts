import forge from 'node-forge'

export function rsaEncrypt(data: string, publicKey: string): string {
  const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g)!.join('\n')}\n-----END PUBLIC KEY-----`
  const pub = forge.pki.publicKeyFromPem(pemKey)
  const encrypted = pub.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha1.create() }
  })
  return forge.util.encode64(encrypted)
}
