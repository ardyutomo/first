# Poster Subtema 1: Lomba Poster Edukasi AMR (WAAW 2026)

Poster vertikal 3508×4385 px (4:5), PNG ±46 MB (syarat lomba 10–100 MB).

## 1. Buat ilustrasi dengan Runway

Model `gemini_2.5_flash`, rasio `1344:768`. Ilustrasi dipotong ke area
3508×1150 px, jadi objek penting harus ada di pita tengah gambar.

```bash
uv run scripts/generate_image.py --model gemini_2.5_flash --ratio 1344:768 \
  --filename ilustrasi_subtema1.png --prompt "$(cat prompt_ilustrasi.txt)"
```

## 2. Unduh logo AMR-WHO

Unduh dari https://link.pom.go.id/urls/LogoAMR, lalu simpan sebagai PNG transparan.

## 3. Susun poster

```bash
python3 compose_poster.py --out "NamaTim_ObatKitaHariIniNyawaMerekaNanti.png" \
  --illustration ilustrasi_subtema1.png --logo logo_amr_who.png
```

Tanpa `--illustration` dan `--logo`, skrip menghasilkan preview layout yang
berisi kotak penanda.
