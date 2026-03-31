import csv
import json
from itertools import product
from pathlib import Path
import random


OUTPUT = Path(__file__).resolve().parent / "review-pool.csv"
MAX_REVIEWS = 10000
SHUFFLE_SEED = 42

openers = [
    "I recently sourced sarees from B.B. Synthetics and the experience was excellent.",
    "We ordered from B.B. Synthetics for our store and were genuinely impressed.",
    "I had a very smooth buying experience with B.B. Synthetics.",
    "B.B. Synthetics gave us the kind of quality and support we were hoping for.",
    "It was a great decision to work with B.B. Synthetics for our saree requirement.",
    "Our experience with B.B. Synthetics has been very positive from start to finish.",
    "I am happy to recommend B.B. Synthetics after seeing their work closely.",
    "B.B. Synthetics stood out to us immediately for both product quality and professionalism.",
    "We were looking for a dependable saree supplier and B.B. Synthetics delivered.",
    "I was impressed by how professionally B.B. Synthetics handled everything.",
]

product_sentences = [
    "The saree collection had strong variety across festive, bridal, daily wear, and premium styles.",
    "Their range covered elegant designer sarees, dyed work sarees, and stylish wholesale pieces.",
    "We saw very good options in fabrics, color stories, and occasion-ready designs.",
    "The collection felt fresh, marketable, and well planned for different customer preferences.",
    "Their assortment had the right mix of classic sarees and trend-focused designs.",
    "The catalog showed great balance between premium looks and commercial practicality.",
    "There was a very good mix of statement sarees, graceful designs, and fast-moving styles.",
    "The collection looked thoughtfully developed for retailers, resellers, and quality-focused buyers.",
    "Their sarees had strong appeal for festive sales, weddings, and regular retail demand.",
    "The overall product range felt polished and commercially smart.",
]

quality_sentences = [
    "The fabric feel, finishing, and detailing were consistently impressive.",
    "The overall quality looked premium and the final finish was neat.",
    "Every piece we checked showed careful workmanship and good finishing standards.",
    "The sarees had a refined look with clean work and attractive presentation.",
    "The quality control was clearly visible in the finishing and overall appearance.",
    "The material, fall, and detailing gave the sarees a rich and reliable feel.",
    "Their finishing quality made the products look premium without feeling overpriced.",
    "The craftsmanship was strong and the sarees looked ready for confident retail selling.",
    "The product quality felt dependable and market-ready.",
    "The work quality was sharp, clean, and appealing across styles.",
]

design_sentences = [
    "The colors, patterns, and styling felt current and customer-friendly.",
    "Their designs looked elegant without becoming repetitive.",
    "The collection had a nice sense of fashion, balance, and wearable appeal.",
    "The design team clearly understands what sells in the saree market.",
    "The sarees had good visual impact while still feeling tasteful.",
    "The styling looked fresh and suitable for a wide range of buyers.",
    "The designs felt premium, attractive, and easy to recommend.",
    "The variety in looks and detailing made the collection stand out.",
    "There was a very appealing blend of traditional charm and modern presentation.",
    "The design choices felt practical for business and attractive for customers.",
]

service_sentences = [
    "Their team was polite, responsive, and easy to coordinate with.",
    "Communication was clear and the whole process felt professional.",
    "They handled queries well and gave prompt support throughout.",
    "The service side was smooth, organized, and dependable.",
    "Their staff was cooperative and genuinely helpful during the process.",
    "The team made the entire buying experience simple and comfortable.",
    "They were attentive, professional, and good at following up.",
    "We appreciated the clarity and professionalism in the way they worked.",
    "The support from their side made the transaction feel reliable.",
    "Their business handling was disciplined and customer-focused.",
]

trust_sentences = [
    "They feel like a supplier you can build a long-term business relationship with.",
    "This is the kind of company that gives confidence for repeat orders.",
    "They come across as reliable, consistent, and serious about quality.",
    "It is easy to trust a team that works with this much clarity and consistency.",
    "They left the impression of a dependable and well-managed saree brand.",
    "The overall experience gave us confidence to work with them again.",
    "They seem committed to both product quality and buyer satisfaction.",
    "The professionalism they showed builds real trust.",
    "Their consistency and conduct make them easy to recommend.",
    "They created confidence not just with products, but with the way they handled business.",
]

closers = [
    "I would definitely recommend B.B. Synthetics to anyone looking for quality sarees and reliable service.",
    "I would happily suggest B.B. Synthetics to buyers who want quality, variety, and professionalism.",
    "Highly recommended for anyone searching for a trusted saree manufacturer in Surat.",
    "B.B. Synthetics is a solid choice for buyers who value quality and dependable support.",
    "This was a very satisfying experience and I would recommend them without hesitation.",
    "For quality sarees and professional handling, B.B. Synthetics is a very good choice.",
    "They are doing impressive work and deserve strong recommendation.",
    "I can confidently recommend B.B. Synthetics to retailers and wholesale buyers.",
    "They offer the kind of quality and service that makes repeat business easy.",
    "If someone wants a dependable saree partner, B.B. Synthetics is worth considering.",
]

template_families = [
    ("opener", "product", "quality", "service", "closer"),
    ("opener", "quality", "design", "service", "closer"),
    ("opener", "product", "design", "trust", "closer"),
    ("opener", "quality", "service", "trust", "closer"),
    ("opener", "product", "quality", "trust", "closer"),
    ("opener", "design", "quality", "service", "closer"),
]

keyword_sets = [
    ["designer sarees", "premium quality", "trusted supplier", "Surat"],
    ["wholesale sarees", "fabric finish", "reliable service", "retailer support"],
    ["bridal sarees", "festive collection", "premium look", "quality work"],
    ["saree manufacturer", "design variety", "professional team", "Surat textile"],
    ["fashion sarees", "clean finishing", "good communication", "repeat orders"],
    ["retail collection", "trusted business", "quality craftsmanship", "wholesale support"],
    ["elegant sarees", "market-ready styles", "dependable partner", "fabric quality"],
    ["traditional and modern", "value for money", "smooth service", "quality manufacturing"],
]

sentence_map = {
    "opener": openers,
    "product": product_sentences,
    "quality": quality_sentences,
    "design": design_sentences,
    "service": service_sentences,
    "trust": trust_sentences,
    "closer": closers,
}


def compose_review(parts: tuple[str, ...], values: tuple[str, ...]) -> str:
    return " ".join(values)


def build_reviews():
    seen = set()
    reviews = []

    for family in template_families:
        buckets = [sentence_map[name] for name in family]

        for values in product(*buckets):
            review_text = compose_review(family, values)

            if review_text in seen:
                continue

            seen.add(review_text)
            reviews.append(review_text)

    return reviews


def iter_reviews():
    reviews = build_reviews()
    random.Random(SHUFFLE_SEED).shuffle(reviews)

    for index, review_text in enumerate(reviews[:MAX_REVIEWS], start=1):
        yield {
            "sequence_no": index,
            "review_text": review_text,
            "keywords": json.dumps(keyword_sets[(index - 1) % len(keyword_sets)]),
        }


with OUTPUT.open("w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["sequence_no", "review_text", "keywords"])
    writer.writeheader()
    writer.writerows(iter_reviews())

print(OUTPUT)
