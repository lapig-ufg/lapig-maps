
if [[ "$filename_noext" == *"250000"* ]]; then
	log "RENAMED $filename_noext"
	rename 's/250000/250/g' $filepath_noext.*
elif [ "$filename_noext" == "amaz_leg_arco_desflorestam" ]; then
	log "RENAMED $filename_noext"
	rename 's/amaz_leg_arco_desflorestam/bi_am_arco_deflorestamento_ibama/g' $filepath_noext.*
elif [ "$filename_noext" == "amazonia_legal" ]; then
	log "RENAMED $filename_noext"
	rename 's/amazonia_legal/bi_am_amazonia_legal_ibama/g' $filepath_noext.*
elif [ "$filename_noext" == "capitais_estaduais_do_brasil" ]; then
	log "RENAMED $filename_noext"
	rename 's/capitais_estaduais_do_brasil/pa_br_capitais_estaduais_250_2009_ibge/g' $filepath_noext.*
elif [ "$filename_noext" == "limites_estaduais" ]; then
	log "RENAMED $filename_noext"
	rename 's/limites_estaduais/pa_br_limite_estadual_250_2010_ibge/g' $filepath_noext.*
elif [ "$filename_noext" == "pa_br_municipios_250_2010_IBGE" ]; then
	log "RENAMED $filename_noext"
	rename 's/pa_br_municipios_250_2010_IBGE/pa_br_limite_municipal_250_2010_ibge/g' $filepath_noext.*
elif [ "$filename_noext" == "pa_br_pastagem_probio_2002" ]; then
	log "RENAMED $filename_noext"
	rename 's/pa_br_pastagem_probio_2002/pa_br_pastagem_probio_250_2002_mma/g' $filepath_noext.*
elif [ "$filename_noext" == "brasil_matadouros_e_frigorificos_final" ]; then
	log "RENAMED $filename_noext"
	rename 's/brasil_matadouros_e_frigorificos_final/pa_br_matadouros_e_frigorificos_2014_lapig/g' $filepath_noext.*
elif [ "$filename_noext" == "pa_br_imoveis_certificados_registrados_incra" ]; then
	log "RENAMED $filename_noext"
	rename 's/pa_br_imoveis_certificados_registrados_incra/pa_br_imoveis_certificados_registrados_2014_incra/g' $filepath_noext.*
elif [ "$filename_noext" == "ucs_protecao_integral" ]; then
	log "RENAMED $filename_noext"
	rename 's/ucs_protecao_integral/pa_br_ucs_protecao_integral/g' $filepath_noext.*
elif [ "$filename_noext" == "ucs_uso_sustentavel" ]; then
	log "RENAMED $filename_noext"
	rename 's/ucs_uso_sustentavel/pa_br_ucs_uso_sustentavel/g' $filepath_noext.*
elif [ "$filename_noext" == "ferrovias_brasil_zee" ]; then
	log "RENAMED $filename_noext"
	rename 's/ferrovias_brasil_zee/pa_br_estacao_ferroviaria_1000_2009_ibge_2/g' $filepath_noext.*
elif [ "$filename_noext" == "principais_hidrovias_brasil" ]; then
	log "RENAMED $filename_noext"
	rename 's/principais_hidrovias_brasil/pa_br_principais_hidrovias/g' $filepath_noext.*
elif [ "$filename_noext" == "pa_br_pastagens_atualizacao_100_poligonos_lapig" ]; then
	log "RENAMED $filename_noext"
	rename 's/pa_br_pastagens_atualizacao_100_poligonos_lapig/pa_br_pastagens_pavan_2014_lapig/g' $filepath_noext.*
elif [ "$filename_noext" == "pa_br_pastagens_atualizacao_100_pontos_lapig" ]; then
	log "RENAMED $filename_noext"
	rename 's/pa_br_pastagens_atualizacao_100_pontos_lapig/pa_br_pastagens_pontos_pavan_2014_lapig/g' $filepath_noext.*
fi