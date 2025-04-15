import { DynamicFormProps } from "@renderer/components/DynamicForm"

export type TabProps = {
    project: ProjectType
    onFormSubmit: DynamicFormProps['onFormSubmit'],
    blockSubmission: true
    blockTooltip: string
} | {
    project: ProjectType
    onFormSubmit: DynamicFormProps['onFormSubmit'],
    blockSubmission: false
    blockTooltip?: string
}
