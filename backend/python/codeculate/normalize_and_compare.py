"""
Bu dosyanın temel amacı: Kullanıcının yazdığı kodları normalize ederek kod kod karşılaştırma
mekanizmasını sağlamak.

- Yorumları ve boşlukları atar.
- String/char/num literal'leri soyutlar.
- Keyword'leri korur (if, for, while, ...)
- Fonksiyon ve sınıf isimlerini korur.
- Diğer tüm tanımlayıcıları (identifier) ilk görüldüğü sıraya göre VAR1, VAR2 ... ile eşler
- Operatör ve noktalama token'larını korur. (yapıyı yansıtsın diye)

Kullanım:
    normalize(kod, dil) -> normalize edilmiş kod
    compare_codes(kod1, kod2, dil) -> kod1 ve kod2 aynı mı?
"""

import re
from typing import List, Dict

KEYWORDS = {
    "python": {
        "False","None","True","and","as","assert","async","await","break","class","continue",
        "def","del","elif","else","except","finally","for","from","global","if","import","in",
        "is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield"
    },
    "javascript": {
        "break","case","catch","class","const","continue","debugger","default","delete","do","else",
        "export","extends","finally","for","function","if","import","in","instanceof","let","new",
        "return","super","switch","this","throw","try","typeof","var","void","while","with","yield",
        "enum","await","implements","package","protected","static","interface","private","public"
    },
    "java": {
        "abstract","assert","boolean","break","byte","case","catch","char","class","const","continue",
        "default","do","double","else","enum","extends","final","finally","float","for","goto","if",
        "implements","import","instanceof","int","interface","long","native","new","package","private",
        "protected","public","return","short","static","strictfp","super","switch","synchronized",
        "this","throw","throws","transient","try","void","volatile","while","record","var"
    },
    "c": {
        "auto","break","case","char","const","continue","default","do","double","else","enum","extern",
        "float","for","goto","if","inline","int","long","register","restrict","return","short","signed",
        "sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Bool",
        "_Complex","_Imaginary"
    },
    "cpp": {
        "alignas","alignof","and","and_eq","asm","auto","bitand","bitor","bool","break","case","catch",
        "char","char8_t","char16_t","char32_t","class","compl","const","consteval","constexpr","constinit",
        "const_cast","continue","co_await","co_return","co_yield","decltype","default","delete","do",
        "double","dynamic_cast","else","enum","explicit","export","extern","false","float","for","friend",
        "goto","if","inline","int","long","mutable","namespace","new","noexcept","not","not_eq","nullptr",
        "operator","or","or_eq","private","protected","public","reflexpr","register","reinterpret_cast",
        "requires","return","short","signed","sizeof","static","static_assert","static_cast","struct",
        "switch","synchronized","template","this","thread_local","throw","true","try","typedef","typeid",
        "typename","union","unsigned","using","virtual","void","volatile","wchar_t","while","xor","xor_eq"
    }
}

def _strip_comments_and_strings(code: str, lang: str) -> str:
    if lang in {"javascript", "java", "c", "cpp"}:
        code = re.sub(r"/\*.*?\*/", "", code, flags=re.S)
        code = re.sub(r"//.*?$", "", code, flags=re.M)
        if lang == "javascript":
            code = re.sub(r"`(?:\\.|[^`])*`", "<STR>", code, flags=re.S)
    if lang == "python":
        code = re.sub(r"([rubfRUBF]?[']{3})(?:.|\n)*?\1", "<STR>", code)
        code = re.sub(r'([rubfRUBF]?["]{3})(?:.|\n)*?\1', "<STR>", code)
        code = re.sub(r"#.*?$", "", code, flags=re.M)
    code = re.sub(r"'(?:\\.|[^'\\])+'", "<STR>", code)
    code = re.sub(r'"(?:\\.|[^"\\])+"', "<STR>", code)
    if lang in {"c", "cpp", "java"}:
        code = re.sub(r"'(?:\\.|[^'\\])'", "<CHAR>", code)
    return code

IDENT = re.compile(r"[A-Za-z_]\w*")
NUMBER = re.compile(r"\b(?:0[xX][0-9A-Fa-f]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b")

def _tokenize(code: str) -> List[str]:
    tokens = []
    i = 0
    while i < len(code):
        ch = code[i]
        if ch.isspace():
            i += 1
            continue
        m_id = IDENT.match(code, i)
        if m_id:
            tokens.append(m_id.group(0))
            i = m_id.end()
            continue
        m_num = NUMBER.match(code, i)
        if m_num:
            tokens.append(m_num.group(0))
            i = m_num.end()
            continue
        tokens.append(ch)
        i += 1
    return tokens

def normalize(code: str, lang: str) -> str:
    lang = lang.lower()
    if lang not in KEYWORDS:
        raise ValueError(f"Desteklenmeyen dil: {lang}")
    cleaned = _strip_comments_and_strings(code, lang)
    tokens = _tokenize(cleaned)
    kw = KEYWORDS[lang]
    id_map: Dict[str, str] = {}
    next_id = 1
    norm_tokens: List[str] = []
    for i, t in enumerate(tokens):
        if IDENT.fullmatch(t):
            if t in kw:
                norm_tokens.append(t)
            elif i + 1 < len(tokens) and tokens[i+1] == "(":
                norm_tokens.append(t)
            elif i > 0 and tokens[i-1] == "." and i + 1 < len(tokens) and tokens[i+1] == "(":
                norm_tokens.append(t)
            elif t.isupper():
                norm_tokens.append(t)
            else:
                if t not in id_map:
                    id_map[t] = f"VAR{next_id}"
                    next_id += 1
                norm_tokens.append(id_map[t])
        elif NUMBER.fullmatch(t):
            norm_tokens.append(t)
        else:
            norm_tokens.append(t)
    norm_str = " ".join(norm_tokens)
    norm_str = re.sub(r"\s+([();,{}\[\]])", r"\1", norm_str)
    norm_str = re.sub(r"([();,{}\[\]])\s+", r"\1", norm_str)
    norm_str = re.sub(r"\s{2,}", " ", norm_str).strip()
    return norm_str

def compare_codes(code1: str, code2: str, lang: str) -> bool:
    return normalize(code1, lang) == normalize(code2, lang)