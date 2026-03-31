import argparse
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont


DEFAULT_URL = "https://search.google.com/local/writereview?placeid=YOUR_GOOGLE_PLACE_ID"
WIDTH = 1400
HEIGHT = 1800


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                r"C:\Windows\Fonts\segoeuib.ttf",
                r"C:\Windows\Fonts\arialbd.ttf",
            ]
        )
    candidates.extend(
        [
            r"C:\Windows\Fonts\segoeui.ttf",
            r"C:\Windows\Fonts\arial.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def make_background() -> Image.Image:
    bg = Image.new("RGB", (WIDTH, HEIGHT), "#08111f")
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((-140, -120, 780, 760), fill=(44, 188, 255, 120))
    gdraw.ellipse((650, 180, 1460, 980), fill=(0, 255, 166, 90))
    gdraw.ellipse((180, 1180, 1020, 1940), fill=(92, 80, 255, 75))
    glow = glow.filter(ImageFilter.GaussianBlur(110))
    bg = Image.alpha_composite(bg.convert("RGBA"), glow)

    panel = Image.new("RGBA", (WIDTH - 140, HEIGHT - 140), (255, 255, 255, 18))
    mask = Image.new("L", panel.size, 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle((0, 0, panel.size[0] - 1, panel.size[1] - 1), radius=42, fill=255)
    panel.putalpha(mask)
    bg.alpha_composite(panel, (70, 70))
    return bg.convert("RGB")


def make_qr(url: str) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    return img.resize((760, 760))


def draw_centered_text(draw: ImageDraw.ImageDraw, y: int, text: str, font: ImageFont.ImageFont, fill: str) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text(((WIDTH - w) / 2, y), text, font=font, fill=fill)
    return y + h


def build_poster(url: str, business: str, tagline: str, output: Path) -> None:
    poster = make_background()
    draw = ImageDraw.Draw(poster)

    title_font = load_font(88, bold=True)
    subtitle_font = load_font(44)
    badge_font = load_font(30, bold=True)
    small_font = load_font(28)

    badge_text = "AKN-POWERED REVIEW QR"
    badge_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    badge_w = badge_bbox[2] - badge_bbox[0]
    badge_h = badge_bbox[3] - badge_bbox[1]
    badge_x = (WIDTH - badge_w - 48) / 2
    badge_y = 140
    draw.rounded_rectangle((badge_x, badge_y, badge_x + badge_w + 48, badge_y + badge_h + 28), radius=24, fill="#0ed3a7")
    draw.text((badge_x + 24, badge_y + 12), badge_text, font=badge_font, fill="#04131d")

    y = 260
    y = draw_centered_text(draw, y, business, title_font, "#0a2135") + 30

    for line in wrap_text(draw, tagline, subtitle_font, WIDTH - 220):
        y = draw_centered_text(draw, y, line, subtitle_font, "#4a6278") + 10

    qr_bg_top = y + 40
    qr_bg_left = 220
    qr_bg_size = 960
    draw.rounded_rectangle(
        (qr_bg_left, qr_bg_top, qr_bg_left + qr_bg_size, qr_bg_top + qr_bg_size),
        radius=54,
        fill="#f7fbff",
    )
    qr_img = make_qr(url)
    poster.paste(qr_img, (320, qr_bg_top + 100))

    prompt_y = qr_bg_top + qr_bg_size + 50
    y = draw_centered_text(draw, prompt_y, "Scan to leave a Google review", load_font(50, bold=True), "#10293d") + 18

    footer_text = "Replace the placeholder link with your Google review URL for live use."
    for line in wrap_text(draw, footer_text, small_font, WIDTH - 220):
        y = draw_centered_text(draw, y, line, small_font, "#6f8698") + 6

    output.parent.mkdir(parents=True, exist_ok=True)
    poster.save(output, format="PNG")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a branded Google review QR poster.")
    parser.add_argument("--url", default=DEFAULT_URL, help="Google review URL or place review link")
    parser.add_argument("--business", default="Your Business", help="Business name to show on the poster")
    parser.add_argument("--tagline", default="Fast, modern, scan-to-review design for your customers.", help="Short tagline")
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parent / "google-review-qr-poster.png"),
        help="Output PNG path",
    )
    args = parser.parse_args()

    build_poster(args.url, args.business, args.tagline, Path(args.out))


if __name__ == "__main__":
    main()
