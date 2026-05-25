import os

files = [
    'src/pages/Profile.jsx',
    'src/pages/CompleteProfile.jsx',
    'src/pages/Chat.jsx'
]

for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add imports
    if "useTranslation" not in content:
        content = content.replace("from 'lucide-react';", "from 'lucide-react';\nimport { useTranslation } from 'react-i18next';")
        content = content.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const { t } = useTranslation();")
    
    # Generic replacements
    content = content.replace(">Send Message<", ">{t('chat.send')}<")
    content = content.replace(">Location<", ">{t('profile.location')}<")
    content = content.replace(">Family Details<", ">{t('profile.family')}<")
    content = content.replace(">About Me<", ">{t('profile.about')}<")
    content = content.replace(">Edit Profile<", ">{t('profile.edit_profile')}<")
    content = content.replace(">Save Changes<", ">{t('profile.save_changes')}<")
    content = content.replace(">Basic Details<", ">{t('profile.basic_details')}<")
    content = content.replace(">Messages<", ">{t('chat.title')}<")
    content = content.replace("years old`", "${t('profile.years_old')}`")

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Translations applied successfully!")
