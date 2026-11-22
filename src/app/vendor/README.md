# Vendored Tailwind helpers

`shadcn-tailwind.css` is the unchanged stylesheet from the MIT-licensed `shadcn`
4.23.0 npm package (`dist/tailwind.css`). Copyright and permission are retained in
`shadcn-LICENSE.md`.

The application only imported this stylesheet. Keeping it locally preserves the
existing utilities without installing the component-generation CLI and its
unneeded registry/code-transformation dependency tree. Existing React/Base UI
components and the immutable design-system kit are unchanged by this extraction.

Source: https://github.com/shadcn-ui/ui/tree/main/packages/shadcn
