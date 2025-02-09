# Deepseek API application example, can be changed to OpenAI or other similar interfaces

def deepseek_r1(query):
	from openai import OpenAI
	"""Use the Reasoner model through the DeepSeek API, which will output its reasoning process and final answer."""
	
	api_key="your api key"
	base_url="https://api.deepseek.com"
	try:
		ds = OpenAI(api_key=api_key, base_url=base_url)
		response = ds.chat.completions.create(
			model='deepseek-reasoner',
			messages=[
				{"role": "system", "content": "You are an office assistant"},
				{"role": "user", "content": query},
			],
			max_tokens=8192,
			temperature=0.8,
			stream=False
		)

		message = response.choices[0].message.content
		reasoning_content = response.choices[0].message.reasoning_content

		r = f"{reasoning_content}\n\n{message}"

		return(r)
	except Exception as e:
		return str(e)

def deepseek_chat(query):
	from openai import OpenAI
	"""Use the Chat model through the DeepSeek API, which will output the final answer."""

	api_key="your api key"
	base_url="https://api.deepseek.com"
	try:
		ds = OpenAI(api_key=api_key, base_url=base_url)
		response = ds.chat.completions.create(
			model='deepseek-chat',
			messages=[
				{"role": "system", "content": "You are an office assistant"},
				{"role": "user", "content": query},
			],
			max_tokens=8192,
			temperature=0.8,
			stream=False
		)

		message = response.choices[0].message.content

		return(message)
	except Exception as e:
		return str(e)