import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parent
countries = list(csv.DictReader((root / 'country-codes.csv').open(encoding='utf-8')))
population = list(csv.DictReader((root / 'population-unwpp.csv').open(encoding='utf-8')))
latest = {r['Code']: int(r['Population (historical estimates)']) for r in population if r['Year'] == '2023'}
extra_codes = set('AS AI AQ AW AX BL BM BQ BV CC CK CW CX EH FK FO GF GG GI GL GP GS GU HK HM IM IO JE KY MF MO MP MQ MS NC NF NU PF PM PN PR RE SH SJ SX TC TF TK TW UM VG VI WF YT'.split())
assert len(extra_codes) == 54
supplements = {
    'AX': (30541, 2023, '年末人口', 'https://www.asub.ax/sv/statistik/befolkningen-2023', '2023年12月31日；奥兰人口也包含在芬兰统计中'),
    'CX': (1692, 2021, '普查常住人口', 'https://www.abs.gov.au/census/find-census-data/quickstats/2021/901011001', '2021年普查；非2023年估计'),
    'CC': (593, 2021, '普查常住人口', 'https://www.abs.gov.au/census/find-census-data/quickstats/2021/901021002', '2021年普查；非2023年估计'),
    'NF': (2188, 2021, '普查常住人口', 'https://www.abs.gov.au/census/find-census-data/quickstats/2021/90104', '2021年普查；非2023年估计'),
    'PN': (40, 2021, '官方旅游部门公布人口', 'https://www.visitpitcairn.pn/', '官方页面标注2021年；非2023年估计'),
    'SJ': (3094, 2023, '斯瓦尔巴定居点人口', 'https://www.ssb.no/befolkning/folketall/statistikk/befolkningen-pa-svalbard', '2023年7月1日：朗伊尔城及新奥勒松2596+巴伦支堡及金字塔城488+霍恩松10；不含扬马延轮换驻站人员'),
}
special_notes = {
    'AQ': '南极洲；人口数留空，不把季节性科研人员当作可比常住人口',
    'BV': '布维岛；UN WPP未提供独立人口序列，留空不等于0',
    'IO': '英属印度洋领土；未取得可比常住人口，未纳入人口小计；不以驻军及工作人员替代',
    'TF': '法属南方领地；未取得可比常住人口，未纳入人口小计',
    'HM': '赫德岛和麦克唐纳群岛；UN WPP未提供独立人口序列，留空不等于0',
    'GS': '南乔治亚和南桑德韦奇群岛；未取得可比常住人口，未纳入人口小计',
    'UM': '美国本土外小岛屿；未取得可比常住人口，未纳入人口小计',
}
name_overrides = {'TW': '中国台湾', 'HK': '中国香港', 'MO': '中国澳门', 'VA': '圣座（梵蒂冈）', 'PS': '巴勒斯坦', 'PN': '皮特凯恩群岛', 'BQ': '博内尔、圣尤斯特歇斯和萨巴', 'SJ': '斯瓦尔巴和扬马延'}
rows = []
for r in sorted(countries, key=lambda x: x['ISO3166-1-Alpha-2']):
    a2, a3 = r['ISO3166-1-Alpha-2'], r['ISO3166-1-Alpha-3']
    extra = a2 in extra_codes
    kind = '195口径之外的ISO条目' if extra else ('联合国非会员观察员国' if a2 in ('VA', 'PS') else '联合国会员国')
    note = ''
    if a3 in latest:
        pop, year, basis, source = latest[a3], 2023, 'UN WPP 2024版年中人口估计', 'https://ourworldindata.org/grapher/population-unwpp'
    elif a2 in supplements:
        pop, year, basis, source, note = supplements[a2]
    else:
        assert a2 in special_notes
        pop, year, basis, source, note = None, None, '未取得可比常住人口；不计入小计', '', special_notes[a2]
    if a2 in ('CK', 'NU'):
        note = '与新西兰自由联系的自治实体；不是联合国会员国或非会员观察员国'
    if a2 == 'EH':
        note = '西撒哈拉；本文件仅按ISO条目及联合国会员/观察员身份分类'
    rows.append([a2, a3, name_overrides.get(a2, r['official_name_cn']), r['official_name_en'] or r['CLDR display name'], '否' if extra else '是', kind, pop, year, basis, note, source, 'https://github.com/datasets/country-codes/blob/master/data/country-codes.csv', '2026-10-11'])
assert len(rows) == 249 and len({r[0] for r in rows}) == 249
assert all(r[2] for r in rows)
base = [r for r in rows if r[4] == '是']
extras = sorted([r for r in rows if r[4] == '否'], key=lambda r: (r[6] is None, -(r[6] or 0), r[0]))
assert len(base) == 195 and sum(r[5] == '联合国会员国' for r in base) == 193
assert {r[0] for r in extras} == extra_codes
summary = {'iso_count': len(rows), 'country_count': len(base), 'extra_count': len(extras), 'population_subtotal': sum(r[6] for r in extras if r[6] is not None), 'population_covered_entries': sum(r[6] is not None for r in extras), 'population_unavailable_codes': [r[0] for r in extras if r[6] is None], 'UN_2023_subtotal': sum(r[6] for r in extras if r[8].startswith('UN WPP')), 'top5': [[r[2], r[6]] for r in extras[:5]]}
header = ['ISO二位代码', 'ISO三位代码', '中文名称', '英文名称', '属于195口径', '名单身份', '人口_人', '人口年份', '人口口径', '备注', '人口来源_URL', '代码名单来源_URL', '检索日期']
(root / 'prepared.json').write_text(json.dumps({'header': header, 'countries': base, 'iso': rows, 'extras': extras, 'summary': summary}, ensure_ascii=False), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False, indent=2))
