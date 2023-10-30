<template>
    <div style="margin: 10em">  
        <b-form>
            <b-overlay :show="busy" rounded="sm">
                <!-- number of decks -->
                <b-form-group
                    label="Number of Decks:"
                    label-for="number-of-decks-input"
                >
                    <b-form-input type="number" v-model="config.numberOfDecks" id="number-of-decks-input" placeholder="1" />
                </b-form-group>
                
                <!-- rank limit input -->
                <b-form-group
                    label="Rank Limit:"
                    label-for="rank-limit-input"
                >
                    <b-form-input type="number" v-model="config.rankLimit" id="rank-limit-input" placeholder="1" />
                </b-form-group>
            </b-overlay>
        </b-form>

        <b-button class="mx-2 my-2" size="m" @click="updateConfig" :disabled="busy">Update</b-button>
    </div>
</template>

<script setup lang="ts">
    import { store } from "../store"
    import { onMounted, ref } from 'vue';
    import { Config } from '../../../server/model';

    // get socket
    const socket = store.socket

    // initial valuess
    let config = ref({numberOfDecks: 2, rankLimit: 2})
    let busy = ref(false)

    let decksInput: HTMLInputElement | null;
    let rankInput: HTMLInputElement  | null;

    // listen to getting config reply
    socket.on("get-config-reply", (newConfig: Config) => {
        // set returning config
        config.value = newConfig
        // update ui
        if (decksInput && rankInput) {
            decksInput.value = config.value.numberOfDecks.toString()
            rankInput.value = config.value.rankLimit.toString()
        }
    })

    // listen updating config reply
    socket.on("update-config-reply", (response: boolean) => {
        // terminate busy form
        busy.value = false
        // if update was rejected, restore ui
        if (!response && decksInput && rankInput) {
            // send event
            getConfig()
        }
    })

    // when html is mounted
    onMounted(async () => {
        // send event
        getConfig()
        // get elements
        decksInput = document.getElementById("number-of-decks-input") as HTMLInputElement
        rankInput  = document.getElementById("rank-limit-input") as HTMLInputElement
        
    })

    // send event through socket to get sever config
    async function getConfig() {
        socket.emit("get-config")
    }

    // send current input to server
    async function updateConfig() {
        // set form as busy
        busy.value = true
        // get values from ui
        if (decksInput && rankInput) {
            config.value.numberOfDecks = parseInt(decksInput.value)
            config.value.rankLimit =  parseInt(rankInput.value)
        }
        // send data to server
        socket.emit("update-config", config.value)
    }

</script>