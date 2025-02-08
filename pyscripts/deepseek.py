#Deepseek API应用示例，可更改为OpenAI或其他类似接口


def deepseek_r1(query):
	from openai import OpenAI
	"""通过DeepSeek API使用Reasoner模型，会输出其思考过程与最终回答。"""
	
	api_key="你的Deepseek API KEY"
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
	"""通过DeepSeek API使用Chat模型，会输出最终回答。"""

	api_key="你的Deepseek API KEY"
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