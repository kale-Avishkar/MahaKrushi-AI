import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    return <div>Error loading todos: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Test - Todos</h1>
      <ul className="list-disc pl-5">
        {todos?.map((todo: any) => (
          <li key={todo.id} className="mb-2">
            <span className="font-semibold">{todo.name}</span>
          </li>
        ))}
        {(!todos || todos.length === 0) && <li>No todos found.</li>}
      </ul>
    </div>
  )
}
