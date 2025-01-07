
import { zlib, unzlib } from 'fflate';

export function compress(data: Uint8Array) {
    return new Promise<Uint8Array>((resolve, reject) => {
        zlib(data, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

export function decompress(data: Uint8Array) {
    return new Promise<Uint8Array>((resolve, reject) => {
        unzlib(data, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}