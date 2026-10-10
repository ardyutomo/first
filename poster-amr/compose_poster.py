"""Susun Poster Subtema 1 (Lomba Poster Edukasi AMR, BPOM WAAW 2026).

Menghasilkan PNG vertikal 3508x4385 px (4:5), tanpa kompresi supaya ukuran
file >= 10 MB sesuai ketentuan lomba.

Pemakaian:
    python3 compose_poster.py --out poster.png \
        [--illustration ilustrasi_runway.png] [--logo logo_amr_who.png]

Tanpa --illustration / --logo, area tersebut diisi kotak penanda (preview layout).
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

W, H = 3508, 4385
MARGIN = 190

NAVY = (11, 37, 69)
TEAL = (19, 168, 158)
ORANGE = (244, 162, 89)
RED = (214, 69, 69)
PAPER = (247, 245, 240)
WHITE = (255, 255, 255)
MUTED = (96, 110, 128)

FONT_DIR = "/usr/share/fonts/opentype/inter/"


def font(weight, size):
    name = {"black": "InterDisplay-Black", "xbold": "InterDisplay-ExtraBold",
            "bold": "Inter-Bold", "semi": "Inter-SemiBold",
            "medium": "Inter-Medium", "regular": "Inter-Regular"}[weight]
    return ImageFont.truetype(FONT_DIR + name + ".otf", size)


def wrap(draw, text, fnt, max_w):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def text_block(draw, xy, text, fnt, fill, max_w, spacing=1.18, align="left"):
    x, y = xy
    for line in wrap(draw, text, fnt, max_w):
        lx = x
        if align == "center":
            lx = x + (max_w - draw.textlength(line, font=fnt)) / 2
        draw.text((lx, y), line, font=fnt, fill=fill)
        y += int(fnt.size * spacing)
    return y


def placeholder(draw, box, label):
    x0, y0, x1, y1 = box
    draw.rectangle(box, fill=(225, 230, 236))
    dash = 40
    for x in range(x0, x1, dash * 2):
        draw.line([(x, y0), (min(x + dash, x1), y0)], fill=MUTED, width=8)
        draw.line([(x, y1), (min(x + dash, x1), y1)], fill=MUTED, width=8)
    for y in range(y0, y1, dash * 2):
        draw.line([(x0, y), (x0, min(y + dash, y1))], fill=MUTED, width=8)
        draw.line([(x1, y), (x1, min(y + dash, y1))], fill=MUTED, width=8)
    fnt = font("semi", min(90, (y1 - y0) // 4))
    text_block(draw, (x0, (y0 + y1) // 2 - fnt.size), label, fnt, MUTED,
               x1 - x0, align="center")


def paste_cover(canvas, path, box):
    """Tempel gambar memenuhi box (crop tengah, seperti CSS object-fit: cover)."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    img = Image.open(path).convert("RGB")
    scale = max(bw / img.width, bh / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)),
                     Image.LANCZOS)
    left, top = (img.width - bw) // 2, (img.height - bh) // 2
    canvas.paste(img.crop((left, top, left + bw, top + bh)), (x0, y0))


def paste_contain(canvas, path, box):
    x0, y0, x1, y1 = box
    img = Image.open(path).convert("RGBA")
    img.thumbnail((x1 - x0, y1 - y0), Image.LANCZOS)
    canvas.paste(img, (x0 + (x1 - x0 - img.width) // 2,
                       y0 + (y1 - y0 - img.height) // 2), img)


def logo(canvas, draw, path, box, label="LOGO AMR-WHO"):
    if path:
        paste_contain(canvas, path, box)
    else:
        placeholder(draw, box, label)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--illustration")
    ap.add_argument("--logo")
    args = ap.parse_args()

    canvas = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(canvas)
    inner = W - 2 * MARGIN

    # --- Header -----------------------------------------------------------
    header_h = 1330
    d.rectangle([0, 0, W, header_h], fill=NAVY)
    tag = "SUBTEMA 1  ·  BIJAK MENGGUNAKAN ANTIMIKROBA, CEGAH RESISTENSI, SELAMATKAN GENERASI"
    tag_f = font("bold", 58)
    tag_w = d.textlength(tag, font=tag_f) + 100
    d.rounded_rectangle([MARGIN, 170, MARGIN + tag_w, 290], radius=60, fill=TEAL)
    d.text((MARGIN + 50, 197), tag, font=tag_f, fill=WHITE)

    logo(canvas, d, args.logo, (W - MARGIN - 330, 330, W - MARGIN, 600))

    title_f = font("black", 270)
    y = 400
    d.text((MARGIN, y), "Obat Kita Hari Ini,", font=title_f, fill=WHITE)
    y += 290
    d.text((MARGIN, y), "Nyawa Mereka Nanti", font=title_f, fill=ORANGE)
    y += 360
    text_block(d, (MARGIN, y),
               "Salah pakai antimikroba sekarang bisa membuat obat tak lagi "
               "mempan untuk anak-cucu kita.",
               font("medium", 92), (214, 224, 236), inner)

    # --- Ilustrasi (Runway) ----------------------------------------------
    ill_box = (0, header_h, W, header_h + 1150)
    if args.illustration:
        paste_cover(canvas, args.illustration, ill_box)
    else:
        placeholder(d, ill_box, "AREA ILUSTRASI RUNWAY: HARI INI vs 2050")
    # label garis waktu di atas ilustrasi
    for label, cx, col in (("HARI INI", W // 4, TEAL), ("2050", 3 * W // 4, RED)):
        f = font("xbold", 84)
        tw = d.textlength(label, font=f)
        d.rounded_rectangle([cx - tw / 2 - 60, header_h + 70,
                             cx + tw / 2 + 60, header_h + 200],
                            radius=65, fill=col)
        d.text((cx - tw / 2, header_h + 92), label, font=f, fill=WHITE)

    # --- Data -------------------------------------------------------------
    y = ill_box[3] + 80
    stats = [("1,27 juta", "kematian di dunia langsung disebabkan AMR (2019)", RED),
             ("39 juta", "nyawa diperkirakan melayang akibat AMR, 2025–2050", ORANGE)]
    col_w = (inner - 90) // 2
    for i, (big, small, col) in enumerate(stats):
        x0 = MARGIN + i * (col_w + 90)
        d.rectangle([x0, y, x0 + 18, y + 330], fill=col)
        d.text((x0 + 70, y - 10), big, font=font("black", 175), fill=NAVY)
        text_block(d, (x0 + 70, y + 190), small, font("medium", 66), MUTED,
                   col_w - 80, spacing=1.2)
    y += 400

    # --- 5 Cara Bijak -----------------------------------------------------
    d.text((MARGIN, y), "5 CARA BIJAK", font=font("black", 110), fill=TEAL)
    y += 165
    tips = [("Pakai hanya dengan resep", "antibiotik adalah obat keras"),
            ("Ikuti dosis & lamanya", "sesuai anjuran dokter/apoteker"),
            ("Bukan untuk flu & pilek", "antibiotik tidak membunuh virus"),
            ("Jangan berbagi obat", "dan jangan simpan sisanya untuk nanti"),
            ("Ragu? Tanya apoteker", "sebelum minum obat apa pun")]
    head_f, sub_f, num_f = font("bold", 90), font("regular", 72), font("black", 82)
    row_h = 150
    for i, (head, sub) in enumerate(tips):
        cy = y + i * row_h
        d.ellipse([MARGIN, cy, MARGIN + 124, cy + 124], fill=NAVY)
        n = str(i + 1)
        d.text((MARGIN + 62 - d.textlength(n, font=num_f) / 2, cy + 14), n,
               font=num_f, fill=WHITE)
        hx = MARGIN + 175
        d.text((hx, cy + 10), head, font=head_f, fill=NAVY)
        sx = hx + d.textlength(head, font=head_f) + 40
        d.text((sx, cy + 26), "— " + sub, font=sub_f, fill=MUTED)
    y += 5 * row_h + 30

    # --- Ajakan -----------------------------------------------------------
    cta_h = 210
    d.rectangle([0, y, W, y + cta_h], fill=TEAL)
    text_block(d, (MARGIN, y + 48), "Bijak hari ini, selamatkan generasi esok.",
               font("xbold", 112), WHITE, inner, align="center")
    y += cta_h

    # --- Footer -----------------------------------------------------------
    d.rectangle([0, y, W, H], fill=NAVY)
    logo(canvas, d, args.logo, (MARGIN, y + 45, MARGIN + 300, H - 45), "LOGO")
    fx = MARGIN + 360
    d.text((fx, y + 60), "One Health, one action: Prevent AMR now",
           font=font("xbold", 96), fill=WHITE)
    d.text((fx, y + 190), "Sumber: Kemenkes RI (2019); GRAM Study, The Lancet (2024)",
           font=font("regular", 56), fill=(170, 186, 204))

    # compress_level=0 -> ±46 MB, memenuhi syarat ukuran 10–100 MB
    canvas.save(args.out, "PNG", compress_level=0)
    print(args.out)


if __name__ == "__main__":
    main()
