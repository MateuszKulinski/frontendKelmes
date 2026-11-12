<template>
    <div class="rich-editor">
        <div class="rich-editor__source-bar" role="tablist" :aria-label="t('richTextEditor.editingMode')">
            <button :id="`${editorId}-text-tab`" type="button" role="tab"
                class="rich-editor__source-btn" :class="{ active: mode === 'text' }"
                :aria-selected="mode === 'text'" :aria-controls="`${editorId}-panel`" @click="setMode('text')">
                {{ t('richTextEditor.plainText') }}
            </button>
            <button v-if="!htmlOnly" :id="`${editorId}-visual-tab`" type="button" role="tab"
                class="rich-editor__source-btn" :class="{ active: mode === 'visual' }"
                :aria-selected="mode === 'visual'" :aria-controls="`${editorId}-panel`" @click="setMode('visual')">
                {{ t('richTextEditor.visualEditor') }}
            </button>
            <button :id="`${editorId}-html-tab`" type="button" role="tab"
                class="rich-editor__source-btn" :class="{ active: mode === 'html' }"
                :aria-selected="mode === 'html'" :aria-controls="`${editorId}-panel`" @click="setMode('html')">
                &lt;/&gt; {{ t('richTextEditor.htmlSource') }}
            </button>
            <button :id="`${editorId}-preview-tab`" type="button" role="tab"
                class="rich-editor__source-btn" :class="{ active: mode === 'preview' }"
                :aria-selected="mode === 'preview'" :aria-controls="`${editorId}-panel`" @click="setMode('preview')">
                {{ t('richTextEditor.preview') }}
            </button>
        </div>
        <div :id="`${editorId}-panel`" role="tabpanel" :aria-labelledby="`${editorId}-${mode}-tab`">
            <template v-if="mode === 'html'">
                <div class="rich-editor__html-tools">
                    <p class="rich-editor__hint">{{ t('richTextEditor.htmlHelp') }}</p>
                    <button type="button" class="rich-editor__source-btn" @click="imageHandler">
                        <BaseIcon name="image" aria-hidden="true" /> {{ t('richTextEditor.insertImage') }}
                    </button>
                </div>
                <textarea ref="sourceRef" class="rich-editor__source-textarea"
                    :value="innerValue" :aria-label="t('richTextEditor.htmlSource')"
                    spellcheck="false" autocapitalize="off" autocorrect="off" wrap="off"
                    @input="handleSourceInput" />
            </template>
            <template v-else-if="mode === 'text' || mode === 'visual'">
                <p class="rich-editor__hint rich-editor__visual-hint">
                    {{ t(mode === 'text' ? 'richTextEditor.textHelp' : 'richTextEditor.visualHelp') }}
                </p>
                <div v-if="mode === 'visual'" class="rich-editor__toolbar" role="toolbar"
                    :aria-label="t('richTextEditor.formatting')" @pointerdown="captureEditorSelection">
                    <select class="rich-editor__select" :aria-label="t('richTextEditor.headers')"
                        :value="blockFormat" @change="formatSelection('formatBlock', ($event.target as HTMLSelectElement).value)">
                        <option value="p">{{ t('richTextEditor.paragraph') }}</option>
                        <option v-for="level in 4" :key="level" :value="`h${level}`">H{{ level }}</option>
                    </select>
                    <select class="rich-editor__select" :aria-label="t('richTextEditor.fontSize')"
                        :value="fontSize" @change="formatSelection('fontSize', ($event.target as HTMLSelectElement).value)">
                        <option value="2">{{ t('richTextEditor.small') }}</option>
                        <option value="3">{{ t('richTextEditor.normal') }}</option>
                        <option value="5">{{ t('richTextEditor.large') }}</option>
                        <option value="7">{{ t('richTextEditor.huge') }}</option>
                    </select>
                    <button v-for="tool in inlineTools" :key="tool.command" type="button"
                        class="rich-editor__tool" :class="{ active: activeCommands[tool.command] }"
                        :aria-label="t(`richTextEditor.${tool.label}`)" :title="t(`richTextEditor.${tool.label}`)"
                        :aria-pressed="!!activeCommands[tool.command]" @mousedown.prevent
                        @click="formatSelection(tool.command)">
                        <BaseIcon :name="tool.icon" aria-hidden="true" />
                    </button>
                    <label v-for="tool in colorTools" :key="tool.command" class="rich-editor__color"
                        :title="t(`richTextEditor.${tool.label}`)">
                        <BaseIcon :name="tool.icon" aria-hidden="true" />
                        <input type="color" v-model="tool.color" :aria-label="t(`richTextEditor.${tool.label}`)"
                            @change="formatSelection(tool.command, tool.color)">
                    </label>
                    <select class="rich-editor__select" :aria-label="t('richTextEditor.alignment')"
                        :value="alignment" @change="formatSelection(($event.target as HTMLSelectElement).value)">
                        <option value="justifyLeft">{{ t('richTextEditor.alignLeft') }}</option>
                        <option value="justifyCenter">{{ t('richTextEditor.alignCenter') }}</option>
                        <option value="justifyRight">{{ t('richTextEditor.alignRight') }}</option>
                        <option value="justifyFull">{{ t('richTextEditor.alignJustify') }}</option>
                    </select>
                    <button v-for="tool in blockTools" :key="tool.command" type="button"
                        class="rich-editor__tool" :class="{ active: activeCommands[tool.command] }"
                        :aria-label="t(`richTextEditor.${tool.label}`)" :title="t(`richTextEditor.${tool.label}`)"
                        :aria-pressed="!!activeCommands[tool.command]" @mousedown.prevent
                        @click="formatSelection(tool.command, tool.value)">
                        <BaseIcon :name="tool.icon" aria-hidden="true" />
                    </button>
                    <button type="button" class="rich-editor__tool" :aria-label="t('richTextEditor.insertLink')"
                        :title="t('richTextEditor.insertLink')" :aria-expanded="linkEditorOpen"
                        @mousedown.prevent @click="openLinkEditor">
                        <BaseIcon name="link" aria-hidden="true" />
                    </button>
                    <button type="button" class="rich-editor__tool" :aria-label="t('richTextEditor.insertImage')"
                        :title="t('richTextEditor.insertImage')" @mousedown.prevent @click="imageHandler">
                        <BaseIcon name="image" aria-hidden="true" />
                    </button>
                    <button type="button" class="rich-editor__tool" :aria-label="t('richTextEditor.clearFormatting')"
                        :title="t('richTextEditor.clearFormatting')" @mousedown.prevent @click="formatSelection('removeFormat')">
                        <BaseIcon name="clearFormatting" aria-hidden="true" />
                    </button>
                </div>
                <div v-if="mode === 'visual' && linkEditorOpen" class="rich-editor__html-tools">
                    <input ref="linkRef" v-model="linkUrl" type="text" inputmode="url"
                        class="rich-editor__link-input" :aria-label="t('richTextEditor.linkUrl')"
                        placeholder="https://" @keydown.enter.prevent="applyLink"
                        @keydown.esc.prevent="linkEditorOpen = false">
                    <button type="button" class="rich-editor__source-btn" @click="applyLink">
                        {{ t('richTextEditor.applyLink') }}
                    </button>
                    <button type="button" class="rich-editor__source-btn" @click="linkEditorOpen = false">
                        {{ t('common.cancel') }}
                    </button>
                </div>
                <iframe :key="mode" ref="textRef" class="rich-editor__preview"
                    :title="t(mode === 'text' ? 'richTextEditor.plainText' : 'richTextEditor.visualEditor')"
                    :srcdoc="textDocument" sandbox="allow-same-origin" @load="setupTextEditor" />
            </template>
            <iframe v-else-if="mode === 'preview'" class="rich-editor__preview"
                :title="t('richTextEditor.preview')" :srcdoc="previewDocument" sandbox="" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import api from '@/core/api/axios';
import BaseIcon from './BaseIcon.vue';
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

const props = withDefaults(defineProps<{
    modelValue: string;
    uploadUrl?: string;
    htmlOnly?: boolean;
}>(), { htmlOnly: false });

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const innerValue = ref(props.modelValue ?? '');
const sourceRef = ref<HTMLTextAreaElement | null>(null);
const linkRef = ref<HTMLInputElement | null>(null);
const linkEditorOpen = ref(false);
const linkUrl = ref('');
const textRef = ref<HTMLIFrameElement | null>(null);
const textDocument = ref(createDocument(innerValue.value));
let savedSelection: Range | null = null;
let cleanupTextEditor: (() => void) | undefined;
const editorId = `rich-editor-${useId()}`;
type EditorMode = 'text' | 'visual' | 'html' | 'preview';
const mode = ref<EditorMode>(props.htmlOnly ? 'html' : 'visual');

const setMode = (value: EditorMode) => {
    if (value === mode.value) return;
    cleanupTextEditor?.();
    cleanupTextEditor = undefined;
    savedSelection = null;
    linkEditorOpen.value = false;
    if (value === 'text' || value === 'visual') textDocument.value = createDocument(innerValue.value);
    mode.value = value;
};

const updateValue = (value: string) => {
    if (value === innerValue.value) return;
    innerValue.value = value;
    emit('update:modelValue', value);
};

const handleSourceInput = (event: Event) => {
    updateValue((event.target as HTMLTextAreaElement).value);
};

watch(() => props.modelValue, (val) => {
    const value = val ?? '';
    if (value !== innerValue.value) {
        innerValue.value = value;
        savedSelection = null;
        if (mode.value === 'text' || mode.value === 'visual') textDocument.value = createDocument(value);
    }
});

watch(() => props.htmlOnly, (htmlOnly) => {
    if (htmlOnly && mode.value === 'visual') setMode('html');
});

function createDocument(html: string) {
    return `<!doctype html>
<html lang="${locale.value}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:16px;font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;overflow-wrap:anywhere;min-height:290px;outline:none}img{max-width:100%;height:auto}table{max-width:100%}body[contenteditable]:empty::before{content:attr(data-placeholder);color:#898989;pointer-events:none}</style>
</head><body>${html}</body></html>`;
}

const previewDocument = computed(() => createDocument(innerValue.value));

const inlineTools = [
    { command: 'bold', icon: 'bold', label: 'bold' },
    { command: 'italic', icon: 'italic', label: 'italic' },
    { command: 'underline', icon: 'underline', label: 'underline' },
    { command: 'strikeThrough', icon: 'strikethrough', label: 'strikethrough' },
];
const colorTools = ref([
    { command: 'foreColor', icon: 'textColor', label: 'textColor', color: '#000000' },
    { command: 'hiliteColor', icon: 'highlight', label: 'backgroundColor', color: '#ffff00' },
]);
const blockTools = [
    { command: 'insertOrderedList', icon: 'orderedList', label: 'orderedList' },
    { command: 'insertUnorderedList', icon: 'listView', label: 'bulletList' },
    { command: 'outdent', icon: 'outdent', label: 'decreaseIndent' },
    { command: 'indent', icon: 'indent', label: 'increaseIndent' },
    { command: 'formatBlock', value: 'blockquote', icon: 'quote', label: 'blockquote' },
];
const activeCommands = ref<Record<string, boolean>>({});
const blockFormat = ref('p');
const fontSize = ref('3');
const alignment = ref('justifyLeft');

const captureEditorSelection = () => {
    const doc = textRef.value?.contentDocument;
    const selection = doc?.getSelection();
    if (!doc || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (doc.body.contains(range.commonAncestorContainer)) savedSelection = range.cloneRange();
};

const updateToolbar = () => {
    const doc = textRef.value?.contentDocument;
    if (!doc || mode.value !== 'visual') return;
    activeCommands.value = Object.fromEntries([...inlineTools, ...blockTools]
        .filter(tool => tool.command !== 'formatBlock')
        .map(tool => [tool.command, doc.queryCommandState(tool.command)]));
    blockFormat.value = doc.queryCommandValue('formatBlock').toLowerCase() || 'p';
    fontSize.value = doc.queryCommandValue('fontSize') || '3';
    alignment.value = ['justifyCenter', 'justifyRight', 'justifyFull']
        .find(command => doc.queryCommandState(command)) ?? 'justifyLeft';
};

const restoreEditorSelection = () => {
    const doc = textRef.value?.contentDocument;
    const selection = doc?.getSelection();
    if (!doc || !selection) return null;
    doc.body.focus();
    const range = savedSelection && doc.body.contains(savedSelection.commonAncestorContainer)
        ? savedSelection : doc.createRange();
    if (range !== savedSelection) {
        range.selectNodeContents(doc.body);
        range.collapse(false);
    }
    selection.removeAllRanges();
    selection.addRange(range);
    return doc;
};

const syncEditorValue = () => {
    if (mode.value !== 'text' && mode.value !== 'visual') return;
    const body = textRef.value?.contentDocument?.body;
    if (!body) return;
    updateValue(body.innerHTML === '<br>' ? '' : body.innerHTML);
};

const formatSelection = (command: string, value?: string) => {
    const doc = restoreEditorSelection();
    if (!doc || mode.value !== 'visual') return;
    const previousHtml = doc.body.innerHTML;
    // Formatuj zaznaczenie w bieżącym DOM, bez przekształcania całego HTML.
    doc.execCommand('styleWithCSS', false, 'false');
    if (command === 'createLink' && value && doc.getSelection()?.isCollapsed) {
        const link = doc.createElement('a');
        link.href = value;
        link.textContent = value;
        doc.execCommand('insertHTML', false, link.outerHTML);
    } else {
        doc.execCommand(command, false, value);
    }
    captureEditorSelection();
    if (doc.body.innerHTML !== previousHtml) syncEditorValue();
    updateToolbar();
};

const openLinkEditor = async () => {
    captureEditorSelection();
    const node = savedSelection?.commonAncestorContainer;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
    linkUrl.value = element?.closest('a')?.getAttribute('href') ?? '';
    linkEditorOpen.value = true;
    await nextTick();
    linkRef.value?.focus();
};

const applyLink = () => {
    if (!linkUrl.value.trim()) return;
    formatSelection('createLink', linkUrl.value.trim());
    linkEditorOpen.value = false;
};

const setupTextEditor = () => {
    cleanupTextEditor?.();
    const doc = textRef.value?.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return;

    body.contentEditable = 'true';
    body.setAttribute('role', 'textbox');
    body.setAttribute('aria-multiline', 'true');
    body.setAttribute('aria-label', t(mode.value === 'text' ? 'richTextEditor.plainText' : 'richTextEditor.visualEditor'));
    body.dataset.placeholder = t('richTextEditor.textPlaceholder');

    const syncText = () => {
        captureEditorSelection();
        syncEditorValue();
        updateToolbar();
    };

    const insertText = (text: string) => {
        const selection = doc.getSelection();
        if (!selection) return;
        const range = selection.rangeCount ? selection.getRangeAt(0) : doc.createRange();
        if (!body.contains(range.commonAncestorContainer)) {
            range.selectNodeContents(body);
            range.collapse(false);
        }
        const fragment = doc.createDocumentFragment();
        text.split(/\r\n?|\n/).forEach((line, index) => {
            if (index) fragment.append(doc.createElement('br'));
            fragment.append(doc.createTextNode(line));
        });
        const last = fragment.lastChild;
        range.deleteContents();
        range.insertNode(fragment);
        if (last) range.setStartAfter(last);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        syncText();
    };

    const handlePaste = (event: ClipboardEvent) => {
        if (mode.value !== 'text' || !event.clipboardData) return;
        event.preventDefault();
        insertText(event.clipboardData.getData('text/plain'));
    };

    const handleKeydown = (event: KeyboardEvent) => {
        if (mode.value !== 'text' || event.key !== 'Enter' || event.isComposing) return;
        event.preventDefault();
        insertText('\n');
    };

    const handleClick = (event: MouseEvent) => {
        if ((event.target as HTMLElement).closest?.('a')) event.preventDefault();
    };

    body.addEventListener('input', syncText);
    body.addEventListener('paste', handlePaste);
    body.addEventListener('keydown', handleKeydown);
    body.addEventListener('click', handleClick);
    const handleSelectionChange = () => {
        captureEditorSelection();
        updateToolbar();
    };
    doc.addEventListener('selectionchange', handleSelectionChange);
    updateToolbar();
    cleanupTextEditor = () => {
        body.removeEventListener('input', syncText);
        body.removeEventListener('paste', handlePaste);
        body.removeEventListener('keydown', handleKeydown);
        body.removeEventListener('click', handleClick);
        doc.removeEventListener('selectionchange', handleSelectionChange);
    };
};

onBeforeUnmount(() => cleanupTextEditor?.());

const imageHandler = () => {
    captureEditorSelection();
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const endpoint = props.uploadUrl ?? '/settings/cms/image';
            const { data } = await api.post<{ url: string }>(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (mode.value === 'html') {
                const start = sourceRef.value?.selectionStart ?? innerValue.value.length;
                const end = sourceRef.value?.selectionEnd ?? start;
                const url = data.url.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                const image = `<img src="${url}" alt="">`;
                updateValue(innerValue.value.slice(0, start) + image + innerValue.value.slice(end));
                await nextTick();
                sourceRef.value?.focus();
                sourceRef.value?.setSelectionRange(start + image.length, start + image.length);
            } else if (mode.value === 'visual' || mode.value === 'text') {
                const doc = restoreEditorSelection();
                if (!doc) return;
                doc.execCommand('insertImage', false, data.url);
                captureEditorSelection();
                syncEditorValue();
            }
        } catch {
            alert(t('richTextEditor.imageUploadError'));
        }
    };
};

</script>

<style>
.rich-editor__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 8px;
    background: #f8f9fa;
    border: 1px solid #ccc;
    border-bottom: none;
}

.rich-editor__tool,
.rich-editor__select,
.rich-editor__color {
    min-height: 32px;
    border: 1px solid #adb5bd;
    border-radius: 4px;
    background: #fff;
    color: #495057;
}

.rich-editor__tool {
    width: 32px;
    padding: 4px;
    cursor: pointer;
}

.rich-editor__tool:hover,
.rich-editor__tool.active {
    background: #0d6efd;
    color: #fff;
    border-color: #0d6efd;
}

.rich-editor .rich-editor__select {
    width: auto;
    max-width: 160px;
    padding: 4px 6px;
    font-size: 13px;
}

.rich-editor .rich-editor__toolbar .rich-editor__color {
    position: static;
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    padding: 4px;
    font-size: 13px;
}

.rich-editor .rich-editor__color input {
    width: 24px;
    height: 22px;
    padding: 0;
    border: 0;
    cursor: pointer;
}

.rich-editor .rich-editor__link-input {
    flex: 1;
    min-width: 160px;
    padding: 4px 8px;
    border: 1px solid #adb5bd;
    border-radius: 4px;
    font-size: 14px;
}

.rich-editor__source-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    background: #f8f9fa;
    border: 1px solid #ccc;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    padding: 8px;
}

.rich-editor__source-btn {
    font-size: 0.8rem;
    padding: 2px 10px;
    border: 1px solid #adb5bd;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    color: #495057;
    transition: background 0.15s;
}

.rich-editor__source-btn:hover,
.rich-editor__source-btn.active {
    background: #0d6efd;
    color: #fff;
    border-color: #0d6efd;
}

.rich-editor__source-textarea {
    display: block;
    width: 100%;
    min-height: 320px;
    font-family: monospace;
    font-size: 0.875rem;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 0 0 6px 6px;
    resize: vertical;
    box-sizing: border-box;
    line-height: 1.5;
    tab-size: 2;
    color: #1f2937;
    background: #fff;
}

.rich-editor__source-textarea:focus-visible,
.rich-editor__source-btn:focus-visible,
.rich-editor__tool:focus-visible,
.rich-editor__select:focus-visible,
.rich-editor__color input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.rich-editor__html-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-bottom: none;
    background: #f8f9fa;
}

.rich-editor__hint {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #59636e;
}

.rich-editor__visual-hint {
    padding: 8px 12px;
    border-inline: 1px solid #ccc;
    background: #f8f9fa;
}

.rich-editor__preview {
    display: block;
    width: 100%;
    min-height: 360px;
    border: 1px solid #ccc;
    border-radius: 0 0 6px 6px;
    background: #fff;
}

</style>
