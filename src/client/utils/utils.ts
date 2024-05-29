export const unique = (values: string[]) => {
    return [... new Set(values)]
}

export const getMidnight = (date: Date) => {
    // Create a new Date object to avoid mutating the original date
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
  