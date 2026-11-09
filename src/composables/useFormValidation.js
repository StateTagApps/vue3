// For tags that wrap a <form>: native validity check, then submit the named fields as an object.
//   const {validateAndSubmitForm} = useFormValidation();
//   <form @submit.prevent="e => validateAndSubmitForm(e, data => $api(..., {body: data}))">
export function useFormValidation() {
    function validateAndSubmitForm(event, submit) {
        const fields = Array.from(event.target.querySelectorAll('input, select, textarea'));
        let valid = true;

        fields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                valid = false;
            }
        });

        if (valid) {
            const data = Object.fromEntries(
                fields
                    .filter(field => field.name)
                    .map(field => [field.name, typeof field.value === 'string' ? field.value.trim() : field.value])
            );
            submit(data, event);
        }

        return valid;
    }

    return {validateAndSubmitForm};
}
