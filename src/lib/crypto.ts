import { Encrypter, Decrypter } from 'age-encryption';
import { randomBytes } from '@noble/hashes/utils';
import { toString as ui8ToString } from 'uint8arrays';

function toBase58(buffer: Uint8Array) {
    return ui8ToString(buffer, 'base58btc');
}

export function generatePassphrase(bits = 128) {
    return toBase58(randomBytes(Math.max(1, (bits / 8) | 0)));
}

export async function encryptData(data: Uint8Array, passphrase?: string) {
    passphrase ??= generatePassphrase();

    const e = new Encrypter();
    e.setPassphrase(passphrase);
    return await e.encrypt(data);
}

export async function decryptData(ciphertext: Uint8Array, passphrase: string) {
    const e = new Decrypter();
    e.addPassphrase(passphrase);
    const plaintext = await e.decrypt(ciphertext);
    
    return plaintext;
}
