"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Tournament } from "@/types/tournament"

export default function HomePage() {

  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {

    fetchTournaments()

  }, [])

  async function fetchTournaments() {

    try {

      const response = await api.get("/tournaments")

      setTournaments(response.data)

    } catch (error) {

      console.error(error)
    }
  }

  return (

    <main className="p-10">

      <h1 className="text-4xl font-bold mb-6">
        Poker Moskva
      </h1>

      <div className="space-y-4">

        {tournaments.map((tournament) => (

          <div
            key={tournament.id}
            className="border rounded-xl p-4"
          >

            <h2 className="text-2xl font-semibold">
              {tournament.name}
            </h2>

            <p>Status: {tournament.status}</p>

            <p>
              Start: {tournament.start_time}
            </p>

          </div>

        ))}

      </div>

    </main>
  )
}