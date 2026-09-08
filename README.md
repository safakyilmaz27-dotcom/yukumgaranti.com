# yukumgaranti.com

Volgograd ve Bakü koridorlarında yük brokerliği için tek sayfalık tanıtım sitesi.
Yapı taşı yok, derleme adımı yok — statik dosyalar. Herhangi bir statik barındırmaya
(Netlify, Cloudflare Pages, GitHub Pages, cPanel) olduğu gibi yüklenebilir.

```
index.html
assets/css/style.css
assets/js/main.js
assets/img/favicon.svg
assets/img/og-cover.svg
robots.txt
sitemap.xml
```

Yerelde görmek için: `python -m http.server 8000` → http://localhost:8000

## Yayına almadan önce doldurulacaklar

| Ne | Nerede |
|---|---|
| Form gönderim adresi (opsiyonel) | `assets/js/main.js` → `SITE.formEndpoint` |
| Alan adı (canonical, OG, sitemap) | `index.html` `<head>`, `robots.txt`, `sitemap.xml` |
| Güven rozetlerindeki iddialar | `index.html` → `.hero-trust` |
| Sosyal paylaşım görseli | `assets/img/og-cover.svg` dosyasını 1200×630 PNG olarak dışa aktarıp `og-cover.png` adıyla kaydedin |
| Alt bilgideki taslak uyarısı | `index.html` sonundaki `<p class="note">` — yayında silinmeli |

## Formlar

`SITE.formEndpoint` boşsa form gönderimi sunucu gerektirmez: doldurulan alanlar hazır bir
WhatsApp mesajına dönüşür ve `wa.me` üzerinden açılır. Bir uç nokta tanımlanırsa
(Formspree vb.) `FormData` olarak POST edilir; istek başarısız olursa otomatik olarak
WhatsApp'a düşer. Her iki formda da görünmez bir `_gotcha` alanı basit bot gönderimlerini eler.

## Notlar

- Tema açık/koyu otomatik (sistem tercihi) + başlıktaki düğmeyle elle seçilebilir; seçim
  `localStorage` içinde `yg-theme` anahtarında saklanır.
- Renk ve tipografi tek kaynaktan yönetilir: `style.css` içindeki `:root` değişkenleri.
- `prefers-reduced-motion` açık kullanıcılarda tüm animasyonlar kapanır.
