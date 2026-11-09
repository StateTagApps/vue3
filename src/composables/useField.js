// Shared by the input tags: label (icon, translated name, or the locus) and the "updated" event on blur.
import {computed, ref} from 'vue';

export const fieldProps = {
    name: {type: String, default: null},
    icon: {type: String, default: null},
    placeholder: {type: String, default: null},
    required: {type: Boolean, default: false}
};

export function useField(props, emit) {
    const changed = ref(false);

    const label = computed(() => props.name ? window.stateTagApp.$translate(props.name) : props.locus + ':');

    const onChange = () => {
        changed.value = true;
    };

    const onBlur = () => {
        if (changed.value) {
            changed.value = false;
            emit('updated', {locus: props.locus, service: props.service});
        }
    };

    return {label, onChange, onBlur};
}
