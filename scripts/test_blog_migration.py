import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location('blog_migration', Path(__file__).with_name('blog-migration.py'))
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


class ConversionTests(unittest.TestCase):
    def test_rich_text_and_image(self):
        source = '<h2>Heading</h2><p>A <strong>bold</strong> <em>term</em> and <a href="/about-us/">link</a>.</p><ul><li>First</li><li>Second</li></ul><figure><img src="/picture.webp" alt="Meaningful"><figcaption>Caption</figcaption></figure>'
        body, assets, unsupported, links = migration.convert(source, 'https://www.oclaw.us/post/')
        self.assertEqual([b['style'] for b in body if b['_type'] == 'block'], ['h2', 'normal', 'normal', 'normal'])
        self.assertEqual([b['listItem'] for b in body if 'listItem' in b], ['bullet', 'bullet'])
        self.assertEqual(links, ['https://www.oclaw.us/about-us/'])
        self.assertEqual(assets, [{'url': 'https://www.oclaw.us/picture.webp', 'alt': 'Meaningful', 'caption': 'Caption', 'role': 'inline'}])
        self.assertEqual(unsupported, [])

    def test_embed_is_blocked_and_recorded(self):
        _, _, unsupported, _ = migration.convert('<figure><div><iframe src="https://example.com/video"></iframe></div></figure>', 'https://www.oclaw.us/post/')
        self.assertIn('iframe embed: https://example.com/video', unsupported)


if __name__ == '__main__':
    unittest.main()
