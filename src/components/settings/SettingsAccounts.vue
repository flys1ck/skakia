<template>
  <div class="space-y-5">
    <SettingsRow label="Lichess">
      <template #description
        ><ConnectionStatus :username="lichess.isConnected ? lichess.username : undefined"
      /></template>
      <Button v-if="lichess.isConnected" variant="outline" :disabled="isDisconnecting" @click="handleDisconnect">
        Disconnect
      </Button>
      <template v-else-if="lichess.isConnecting">
        <Button variant="ghost" @click="lichess.cancelLogin()">Cancel</Button>
        <Button disabled><Spinner data-icon="inline-start" />Connecting...</Button>
      </template>
      <Button v-else @click="handleConnect">Connect</Button>
    </SettingsRow>
    <SettingsRow v-if="chessdotcom.username" label="Chess.com">
      <template #description><ConnectionStatus :username="chessdotcom.username" /></template>
      <Button variant="outline" @click="chessdotcom.username = ''">Disconnect</Button>
    </SettingsRow>
    <form v-else @submit.prevent="connectChessdotcom">
      <Field :data-invalid="chessdotcomUsernameErrors.length > 0 || undefined">
        <FieldLabel for="chessdotcom-username">Chess.com username</FieldLabel>
        <div class="flex items-start gap-2">
          <Input
            id="chessdotcom-username"
            name="chessdotcom-username"
            class="grow"
            spellcheck="false"
            :aria-invalid="chessdotcomUsernameErrors.length > 0 || undefined"
            v-model.trim="chessdotcomUsernameInput"
          />
          <Button type="submit" :disabled="isValidatingChessdotcomUsername">
            <Spinner v-if="isValidatingChessdotcomUsername" data-icon="inline-start" />
            Connect
          </Button>
        </div>
        <FieldError :errors="chessdotcomUsernameErrors" />
        <FieldDescription>No sign-in needed. Your public games are loaded by username.</FieldDescription>
      </Field>
    </form>
  </div>
</template>

<script setup lang="ts">
import ConnectionStatus from "@components/settings/ConnectionStatus.vue";
import SettingsRow from "@components/settings/SettingsRow.vue";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useLichess } from "@stores/useLichess";
import { ref } from "vue";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const lichess = useLichess();
const isDisconnecting = ref(false);

async function handleConnect() {
  try {
    await lichess.login();
  } catch {
    // Error is already surfaced via toast in the store
  }
}

async function handleDisconnect() {
  isDisconnecting.value = true;
  try {
    await lichess.logout();
  } finally {
    isDisconnecting.value = false;
  }
}

const chessdotcom = useChessDotCom();
const chessdotcomUsernameSchema = z
  .string()
  .min(1, "Enter your Chess.com username.")
  .regex(/^[A-Za-z0-9_-]+$/, "Usernames can only contain letters, numbers, underscores and hyphens.");
const chessdotcomUsernameInput = ref(chessdotcom.username);
const chessdotcomUsernameErrors = ref<string[]>([]);
const isValidatingChessdotcomUsername = ref(false);

async function connectChessdotcom() {
  const result = chessdotcomUsernameSchema.safeParse(chessdotcomUsernameInput.value);
  if (!result.success) {
    // An empty value fails both rules, and only the first message is useful
    chessdotcomUsernameErrors.value = result.error.issues.slice(0, 1).map((issue) => issue.message);
    return;
  }

  isValidatingChessdotcomUsername.value = true;
  try {
    const isValid = await chessdotcom.validateAndSetUsername(result.data);
    chessdotcomUsernameErrors.value = isValid ? [] : ["No Chess.com player has this username."];
  } catch {
    chessdotcomUsernameErrors.value = ["Could not reach Chess.com. Try again."];
  } finally {
    isValidatingChessdotcomUsername.value = false;
  }
}
</script>
