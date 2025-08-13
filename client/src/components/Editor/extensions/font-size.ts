import { Extension } from "@tiptap/react";
import TextStyle from "@tiptap/extension-text-style";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType;
            unsetFontSize: () => ReturnType;
        };
    }
}

export const FontSizeExtension = Extension.create({
    name: "fontSize",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addExtensions() {
        return [TextStyle];
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }

                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (size: string) =>
                ({ chain }) =>
                    chain().setMark("textStyle", { fontSize: size }).run(),

            unsetFontSize:
                () =>
                ({ chain }) =>
                    chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
        };
    },
});
