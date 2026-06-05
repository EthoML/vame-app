import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import TerminalModal from "../TerminalModal"
import { extractDefaultValues } from "@renderer/utils/extractDefaultValues"
import { Button, LogsButton, InputGroup, InputLabel, FormLayout, FormScrollContent, FormFooter } from './styles';
import DynamicInput from "./DynamicInput"
import { header } from "@renderer/utils/text";

export interface DynamicFormProps {
  schema: Schema
  initialValues?: Record<string, unknown>
  onFormSubmit: <T = unknown>(data: T) => void
  blockSubmission?: boolean
  submitText: string
  showLogsButton?: boolean
  logName?: string | string[]
  projectPath?: string
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onFormSubmit,
  blockSubmission,
  initialValues,
  submitText = "Submit",
  showLogsButton = false,
  logName,
  projectPath,
}) => {
  const [logsOpen, setLogsOpen] = useState(false)

  const defaultValues = {
    ...extractDefaultValues(schema),
    ...initialValues
  }

  const methods = useForm({
    disabled: blockSubmission,
    defaultValues,
  })

  const properties = Object.entries(schema.properties)
  const readOnly = properties.length > 0 && !properties.some(([_, p]) => !p.readOnly)

  // const handleSubmit = (data) => {
  //   console.log(data)
  //   onFormSubmit(data)
  // }

  return (
    <FormProvider {...methods}>

      <FormLayout
        onSubmit={methods.handleSubmit(onFormSubmit)}
      >
        <FormScrollContent>
          {properties.map(([name, property]) => {
            const required = schema.required?.includes(name)

            return (
              <InputGroup key={name}>
                <InputLabel required={required} readOnly={property.readOnly}>
                  <span>{property.title ?? header(name)}</span>
                  {property.description && <small>{property.description}</small>}
                </InputLabel>
                <DynamicInput name={name} property={property} required={required} readOnly={property.readOnly} />
              </InputGroup>
            )
          })}
        </FormScrollContent>
        <FormFooter>
          <Button type="submit" disabled={blockSubmission || readOnly}>{submitText}</Button>
          {showLogsButton && (
            <LogsButton type="button" onClick={() => setLogsOpen(true)}>
              Logs <FontAwesomeIcon icon={faTerminal} />
            </LogsButton>
          )}
        </FormFooter>
        {showLogsButton && (
          <TerminalModal
            isOpen={logsOpen}
            onClose={() => setLogsOpen(false)}
            logName={logName || ''}
            projectPath={projectPath || ''}
          />
        )}
      </FormLayout>
    </FormProvider>
  );
}

export default DynamicForm
