<template>
    <div class="cardPaper" :id="'card'+props.card.id">
        <p> {{props.card.suit}} {{props.card.rank}} </p>
    </div>
</template>

<script setup lang="ts">
    import { store } from "../store"
    import { onMounted } from "vue";
    import { areCompatible, Card } from "../../../server/model"

    // props
    interface Props {
        card: Card
    }

    // get props of this card
    const props = defineProps<Props>()

    // get socket
    const socket = store.socket

    // emit event
    socket.emit('card-created', props.card.id)

    let cardElement: HTMLElement | null;

    // when html is ready
    onMounted(() => {
        // get element corresponding to this component
        cardElement = document.getElementById(`card${props.card.id}`)
    })

    // listen last-card event
    socket.on("last-card", (lastCard: Card) => {
        // if last card has been set
        if (lastCard && cardElement?.parentElement) {
            // check this card compatibilty
            if (areCompatible(props.card, lastCard)) {
                // if compatibe, remove class so the correct CSS style applies
                cardElement?.classList.remove("incompatible");
            } else {
                // add class to turn on CSS style
                cardElement?.classList.add("incompatible");
            }

            // check if this card has been set to unused
            if (props.card.locationType == "unused") {
                // remove card from display
                cardElement.parentElement.style.display = "none"
            }

            // if this card is the last card
            if (props.card.id === lastCard.id) {
                // apply CSS style
                cardElement?.classList.add("lastCard");
                // move it to the first place in flex box
                cardElement.parentElement.style.order = "-1"
            }
        }
    })

</script>

<style>
    /* general card style */
    .cardPaper {
        border: 2px black solid;
        width: 5em;
        height: 6em;
        padding: 0.2em;
        background-color: white;
    }

    /* card text */
    .cardPaper p {
        margin: 0;
    }

    /* incompatible cards only */
    .incompatible {
        background-color: lightgrey;
        border-color: lightgrey;
        color: grey;
    }

    /* last card only */
    .lastCard {
        border: 2px blue solid;
        background-color: bisque;
    }
</style>