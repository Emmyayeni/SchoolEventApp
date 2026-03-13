const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fakeLogin(payload, accepted) {
  await delay();
  if (
    payload.email?.trim().toLowerCase() === accepted.email &&
    payload.password?.trim() === accepted.password
  ) {
    return { success: true };
  }
  return { success: false, message: "Invalid login credentials." };
}

export async function fakeRegister(payload) {
  await delay();
  return { success: true, data: payload };
}

export async function fakeGetEvents(events) {
  await delay();
  return { success: true, data: events };
}

export async function fakeCreateEvent(event) {
  await delay();
  return { success: true, data: event };
}

export async function fakeRegisterEvent(eventId) {
  await delay();
  return { success: true, data: { eventId } };
}
