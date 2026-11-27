# Trajetória Oncológica BH — demonstração fictícia

## Contexto
Este projeto demonstra o assistente com uma coorte inteiramente sintética de trajetórias oncológicas em Belo Horizonte. Não utiliza prontuários reais e não produz recomendações clínicas.

## Perguntas de Pesquisa / Hipóteses
Como os intervalos entre diagnóstico e tratamento variam entre os grupos representados nos dados sintéticos? A hipótese de demonstração é que o perfil da população influencia esses intervalos.

## Objetivos
Descrever a coorte sintética, calcular intervalos de atendimento e comparar indicadores entre grupos, documentando a preparação e as limitações dos dados.

## Fontes de Dados
Usar o catálogo oncológico de demonstração, com tabelas patients e cancer_diagnoses. As estruturas representam fontes APAC/SIA, SIH e SIM apenas para exercitar a importação e a vinculação por identificador anonimizado.

## População do Estudo
A coorte de teste contém pacientes sintéticos atendidos em Belo Horizonte, incluindo residentes de outros municípios. Considerar os sítios de mama, próstata, cólon/reto e pulmão, sem intervenção clínica.

## Variáveis e Desfechos
Incluir identificador sintético, idade, sexo, município, sítio tumoral e datas de diagnóstico e tratamento. Calcular intervalos somente quando as datas forem válidas e registrar valores ausentes separadamente.

## Métodos / Plano de Análise
Validar os campos, padronizar códigos e datas e verificar duplicidades antes de vincular as tabelas. Produzir estatísticas descritivas e comparações exploratórias, registrando contagens de exclusão e evitando inferências clínicas a partir da demonstração.

## IA Responsável
Comparar a qualidade dos dados e os resultados por subgrupo. Qualquer modelo exploratório deve apresentar limitações e explicabilidade, permanecer sob revisão humana e não orientar decisões sobre pacientes.

## Artefatos e Entregáveis Esperados
Gerar um documento de projeto, um script de preparação, um dicionário de variáveis e um relatório com verificações de qualidade dos dados sintéticos.

## Riscos e Limitações
Dados sintéticos não permitem estimar efeitos ou desempenho em populações reais. Os resultados servem exclusivamente para validar a interface e o fluxo de trabalho.

## Referências
Catálogo sintético e roteiro local de demonstração da plataforma. Este exemplo não substitui um protocolo ou uma revisão bibliográfica científica.
