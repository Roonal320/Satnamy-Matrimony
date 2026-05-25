import os

filepath = "src/pages/Landing.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '"Search by city, education, occupation..."': "{t('landing.search_placeholder')}",
    '>Advanced Filters<': ">{t('landing.advanced_filters')}<",
    '>Gender<': ">{t('landing.gender')}<",
    '"Any"': "{t('landing.any')}",
    '>Male<': ">{t('landing.male')}<",
    '>Female<': ">{t('landing.female')}<",
    '>Marital Status<': ">{t('landing.marital_status')}<",
    '>Never Married<': ">{t('landing.never_married')}<",
    '>Divorced<': ">{t('landing.divorced')}<",
    '>Widowed<': ">{t('landing.widowed')}<",
    '>Education<': ">{t('landing.education')}<",
    '"e.g., Bachelor\'s"': "{t('landing.education_placeholder')}",
    '>City<': ">{t('landing.city')}<",
    '"e.g., Raipur"': "{t('landing.city_placeholder')}",
    '>State<': ">{t('landing.state')}<",
    '"e.g., Chhattisgarh"': "{t('landing.state_placeholder')}",
    '>Income Range<': ">{t('landing.income')}<",
    '>Below 3 Lakhs<': ">{t('landing.income_below_3')}<",
    '>3-5 Lakhs<': ">{t('landing.income_3_5')}<",
    '>5-7 Lakhs<': ">{t('landing.income_5_7')}<",
    '>7-10 Lakhs<': ">{t('landing.income_7_10')}<",
    '>10-15 Lakhs<': ">{t('landing.income_10_15')}<",
    '>Above 20 Lakhs<': ">{t('landing.income_above_20')}<",
    '>Apply Filters<': ">{t('landing.apply_filters')}<",
    '>Find Your Perfect Match<': ">{t('landing.perfect_match')}<",
    '>Loading profiles...<': ">{t('landing.loading')}<",
    '>No profiles found. Try adjusting your filters.<': ">{t('landing.no_profiles')}<",
    '>Login to View<': ">{t('landing.login_to_view')}<",
    '>Premium<': ">{t('landing.premium')}<",
    '>Ready to Connect?<': ">{t('landing.ready_connect')}<",
    '>Register now to view full profiles and start your journey<': ">{t('landing.ready_subtitle')}<",
    ' years`': " ${t('landing.years')}`"
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
