import axios from "axios";

let accessToken = "";

export function login(email, password) {
    console.log("login starts...")
    return axios
        .post(
            "https://kodbazis.hu/api/login-user",
            { email, password },
            { withCredentials: true }
        )
        .then((res) => {
            accessToken = res.data.accessToken;
            console.log("accessToken: " + res.data.accessToken )
        });
}
export function logout() {
    return axios
        .post(
            "https://kodbazis.hu/api/logout-user",
            {},
            { withCredentials: true }
        )
        .then((res) => {
            accessToken = "";
        });
}
// hitelesíés automatizálása interceptorok segítségével: lejárt accessToken esetén azt automatikusan megújítjuk és újra küldjük a kérést
export const fetchHitelesitessel = axios.create(); // az interceptors alatti kóddal lekérhetjük a kimenő kérés konfigurációját/hibáját, és a bejövő válasz tartalmát/hibáját; a create létrehoz egy axios client példányt;

fetchHitelesitessel.interceptors.request.use( // REQUEST esetén hívódik meg?
    (config) => {
        if (!accessToken) { // ha az accessToken üres, akkor visszaküldjük a konfigurációt
            return config;
        }   

        return { // ha az accessToken nem üres, akkor visszaküldjük a konfiguráció az Authorization header-rel
            ...config, // a ... a dekompozíciót jelenti
            headers: {
                ...config.headers,
                Authorization: `Bearer ${accessToken}`, // ilyen kimenő kéréseknél elküldjük az accessToken-t
            },
        };
    },
    (error) => Promise.reject(error) // hibák esetén Promise.reject a válasz
);

fetchHitelesitessel.interceptors.response.use( // RESPONSE esetén hívódik meg?
    (response) => response, // sikeres válasz esetén visszaadjuk a választ
    (error) => {
        if (error.response.status !== 403) { // ha nem hitelesítési hiba, akkor hibával térünk vissza
            return Promise.reject(error); 
        }

        const originalRequest = error.config; // elmentjük az erőforrást  (amire a szever elutasította a választ) a későbbi érvényes accessToken-es fetchHitelesitesel lekéréshez
        if (originalRequest.isRetry) { // ha hitelesítési hiba, akkor egy próbálkozást engedünk tovább, különben hibával megállítjuk
            return Promise.reject(error);
        }

        originalRequest.isRetry = true;

        return axios // hitelesítési hiba esetén (Token expired) egy alkalommal megújtíjuk az accessToken-t
            // kiküldjük a kérést a lenti útvonalra
            .get("https://kodbazis.hu/api/get-new-access-token", { 
                withCredentials: true, // engedélyezzük a süti adatok küldését, ezzel együtt elküldjük a refreshTokent a szervernek
            })
            .then((res) => {
                accessToken = res.data.accessToken; // elmentjük a kapott accessToken értékét a memóriában
            })
            .then(() => fetchHitelesitessel(originalRequest)); // ismét kérést küldünk az eredeti védett erőforrásra, amihez a headerben mellékeljük az érvényes accessToken süti értéket, 
    }
);
