// @ts-check

declare module '@calumk/codecup' {
    import { Grammar } from 'prismjs';

    declare class CodeFlask {
        constructor(selectorOrElement: string | HTMLElement, opts: CodeFlask.options);
        onUpdate(callback: (code: string) => void): void;
        updateCode(newCode: string): void;
        getCode(): string;

        // https://github.com/calumk/codecup/blob/3a20a03624820d1cf1af0015098663bb343cb1ab/src/codecup.js#L470-L472
        // addLanguage(name: string, options: Grammar): void;
        dispose();
        toggleLineNumbers();
        updateLanguage(name: string);
        updateEditorHeight();
    }

    export = CodeFlask;

    declare namespace CodeFlask {
        interface options {
            language?: string,
            rtl?: boolean,
            tabSize?: number,
            enableAutocorrect?: boolean,
            lineNumbers?: boolean,
            defaultTheme?: boolean,
            areaId?: string,
            ariaLabelledby?: string,
            readonly?: boolean,
            handleTabs?: boolean,
            handleSelfClosingCharacters?: boolean,
            handleNewLineIndentation?: boolean,
            styleParent?: ShadowRoot,
            
            copyButton?: boolean,
            maxLines?: number,
            minLines?: number,
        }
    }

}