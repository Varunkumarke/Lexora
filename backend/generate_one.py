import os
import gc
import torch

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    pipeline,
    BitsAndBytesConfig,
)

definition_routes = APIRouter()

MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"


def load_llama3_4bit():
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
    )

    return pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_new_tokens=512,
        temperature=0.7,
        top_p=0.95,
        do_sample=True,
    )


class ExpertRequest(BaseModel):
    word: str
    domain: str


@definition_routes.post("/generate-definition")
async def generate_definition(
    request: ExpertRequest,
    http_request: Request,
):
    try:
        generator = http_request.app.state.generator

        prompt = (
            f"Act like a senior {request.domain} expert. "
            f"Give me a definition of {request.word} and 2 examples of it. "
            f"Format the output exactly as follows:\n\n"
            f"## Definition\n"
            f"[Provide definition here]\n\n"
            f"## Examples\n"
            f"1. [First example]\n"
            f"2. [Second example]"
        )

        raw = generator(
            prompt,
            num_return_sequences=1,
        )[0]["generated_text"]

        answer = raw[len(prompt):].strip()

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        gc.collect()

        return {
            "word": request.word,
            "domain": request.domain,
            "response": answer,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
