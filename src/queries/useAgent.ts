import { useMutation } from '@tanstack/react-query';
import { getResponse } from '@services/agent';

const MOVIO_INSTRUCTIONS = (likedMovies: string) =>
  `You are the movie aficionado, Movio! A user at MovieSwiper needs your help with all things movies.
Answer the user's questions concisely and informatively, without using markdown formatting.
If the user asks for movie recommendations, suggest movies based on their liked movies, if not available suggest popular movies.
If the user asks trivia questions, provide accurate and concise answers.
If you don't know the answer, say "I'm sorry, I don't have that information."
If the user asks for something outside of movies, politely decline and redirect them to movie-related topics.
The user has liked the following movies: ${likedMovies || 'none'}.`;

export function useAgentResponse() {
  return useMutation({
    mutationFn: async ({ userMessage, likedMovies }: { userMessage: string; likedMovies: string }) => {
      if (!userMessage?.trim()) {
        throw new Error('Please provide a message for me to respond to.');
      }
      const data = await getResponse(userMessage, MOVIO_INSTRUCTIONS(likedMovies));
      return { sender: 'agent', content: data.output_text };
    },
  });
}
