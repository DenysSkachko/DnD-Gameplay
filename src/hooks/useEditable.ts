export const handleCancel = <T extends Record<string, any>>(
  data: T | undefined,
  setLocalData: (value: T) => void,
  setEditMode: (value: boolean) => void,
  omitKeys: [string, string] = ['id', 'character_id']
) => {
  if (data) {
    const { [omitKeys[0]]: _, [omitKeys[1]]: __, ...rest } = data
    setLocalData(rest as T)
    setEditMode(false)
  }
}

export const handleSave = async <T extends Record<string, any>>(
  localData: T | null,
  originalData: T | undefined,
  setEditMode: (value: boolean) => void,
  createFn: (data: T) => Promise<any>,
  updateFn: (data: T & { id: number }) => Promise<any>,
  idKey: keyof T = 'id'
) => {
  if (!localData) return

  if (originalData) {
    // собираем payload для update с обязательным id
    const updatePayload = { ...localData, [idKey]: originalData[idKey] } as T & { id: number }
    await updateFn(updatePayload)
  } else {
    await createFn(localData)
  }

  setEditMode(false)
}
