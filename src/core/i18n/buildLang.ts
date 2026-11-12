export type Lang = 'pl' | 'en' | 'de'

type TranslationValue = string | { [key: string]: TranslationValue }

export type ModuleTranslations = {
    [key in Lang]: Record<string, TranslationValue>
}

export type ModulesInput = Record<string, ModuleTranslations>

export type MessagesOutput = {
    [key in Lang]: Record<string, Record<string, TranslationValue>>
}

export function buildLang(modules: ModulesInput): MessagesOutput {
    const result = {} as MessagesOutput

    for (const [moduleName, module] of Object.entries(modules)) {
        for (const lang of Object.keys(module) as Lang[]) {
            if (!result[lang]) {
                result[lang] = {}
            }

            if (!result[lang][moduleName]) {
                result[lang][moduleName] = {}
            }

            Object.assign(result[lang][moduleName], module[lang])
        }
    }

    return result
}