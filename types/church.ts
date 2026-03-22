export type ChurchFormData = {
  name: string
  location: string
  type: "Headquarter" | "Circuit"
  description: string
  pastorName: string
  image?: File | null
}