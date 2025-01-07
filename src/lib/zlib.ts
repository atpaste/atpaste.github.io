
import { zlib, unzlib } from 'fflate';

export function compress(data: Uint8Array, level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    return new Promise<Uint8Array>((resolve, reject) => {
        zlib(data, { level }, (err, data) => {
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