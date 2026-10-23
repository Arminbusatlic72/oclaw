import json
import unittest
from pathlib import Path

from practice_areas_convert import convert


INVENTORY = json.loads(Path(__file__).with_name("practice-areas-inventory.json").read_text())


class ConversionTests(unittest.TestCase):
    def test_all_source_words_are_preserved(self):
        for pair in INVENTORY["items"]:
            for language in ("english", "spanish"):
                record = pair[language]
                with self.subTest(slug=record["slug"]):
                    result = convert(record["contentHtml"])
                    self.assertEqual(result["issues"], [])
                    self.assertGreater(len(result["body"]), 0)

    def test_hand_typed_bullets_become_list_items(self):
        record = next(pair["english"] for pair in INVENTORY["items"] if pair["english"]["slug"] == "fiancee-k-1-visa")
        blocks = convert(record["contentHtml"])["body"]
        self.assertGreaterEqual(sum(block.get("listItem") == "bullet" for block in blocks), 10)

    def test_underlining_and_empty_layout_wrapper(self):
        consular = next(pair["english"] for pair in INVENTORY["items"] if pair["english"]["slug"] == "consular-processing")
        blocks = convert(consular["contentHtml"])["body"]
        self.assertTrue(any("underline" in span["marks"] for block in blocks for span in block["children"]))
        permanent = next(pair["english"] for pair in INVENTORY["items"] if pair["english"]["slug"] == "permanent-residency-status")
        self.assertEqual(convert(permanent["contentHtml"])["issues"], [])


if __name__ == "__main__":
    unittest.main()
