// Screen size and orientation, debounced on resize.
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';

export function useRotation(debounceMs = 150) {
    const screenWidth = ref(window.innerWidth);
    const screenHeight = ref(window.innerHeight);
    const isPortrait = computed(() => screenHeight.value > screenWidth.value);
    let timer = null;

    const update = () => {
        screenWidth.value = window.innerWidth;
        screenHeight.value = window.innerHeight;
    };

    const onResize = () => {
        clearTimeout(timer);
        timer = setTimeout(update, debounceMs);
    };

    onMounted(() => {
        update();
        window.addEventListener('resize', onResize);
    });

    onBeforeUnmount(() => {
        clearTimeout(timer);
        window.removeEventListener('resize', onResize);
    });

    return {screenWidth, screenHeight, isPortrait};
}
