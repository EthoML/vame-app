import styled from "styled-components";
import ButtonComponent from "@renderer/components/Button"

// --- Layout for the whole form ---
export const FormLayout = styled.form`
  display: flex;
  flex-direction: column;
  min-height: 0; /* for flexbox scrolling */
`;

/* --- Footer for the button --- */
export const FormFooter = styled.div`
  flex-shrink: 0;
  padding: 16px 0 24px 0;
  background: transparent;
  display: flex;
  align-items: flex-end;
  bottom: 0;
`;

/* --- Scrollable content area above the button --- */
export const FormScrollContent = styled.div`
  height: calc(100% - 56px);
  overflow-y: auto;
  min-height: 0;
`;

// Accordion Component
export const Accordion = styled.div`
  background-color: #f1f1f1;
  border-radius: 5px;
  margin-bottom: 10px;
`;

export const AccordionHeader = styled.div`
  background-color: black;
  color: white;
  cursor: pointer;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface AccordionContentProps {
  $isOpen: boolean;
}

export const AccordionContent = styled.div<AccordionContentProps>`
  padding: 10px;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
`;

export const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 4px; /* Reduced gap between label and input */
  margin-bottom: 20px; /* Increased spacing between form items */
`;

interface InputLabelProps {
  required?: boolean;
  readOnly?: boolean;
}

export const InputLabel = styled.label<InputLabelProps>`
  display: flex;
  align-items: flex-start;

  span {
    font-weight: bold;
  }

  small {
    font-size: 12px;
    color: #666;
    margin-left: 5px;
    &:before {
      content: '(';
    }
    &:after {
      content: ')';
    }
  }

  &[required] span:after {
    content: '*';
    color: red;
    margin-left: 5px;
  }

  &[readOnly] span:after {
    content: 'read only';
    color: gray;
    margin-left: 5px;
  }
`;

export const Button = styled.button`
  padding: 10px;
  width: 100%;
  background-color: #0056b3;
  color: white;
  border: 2px solid #007bff;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover,
  &:focus {
    background-color: #003366;
    color: white;
  }

  &[disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

export const ArrayItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const ArrayItemWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const List = styled.ol`
  margin: 0;
`;

export const ArrayButtons = styled.div`
  display: flex;
  gap: 5px;
`;

export const ArrayButton = styled.button`
  color: black;
  background: none;
  border: none;
  cursor: pointer;
`;

export const AddButton = styled(ButtonComponent)`
  background-color: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FileSelectorBody = styled.div`
  display: grid;
  gap: 10px;

  input[type='file'] {
    color: transparent;
  }

  input[type="file"]::-webkit-file-upload-button {
    background-color: black;
    color: white;
    padding: 5px 20px;
    border-radius: 5px;
    border: none;
  }
`;

export const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
`;

export const FileListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  overflow: auto;
`;
