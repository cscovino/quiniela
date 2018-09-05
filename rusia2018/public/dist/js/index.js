var app = {
    model: {},

    firstentry:1,

    datatable:{},

    a:{},
    b:{},
    c:{},
    d:{},
    e:{},
    f:{},
    g:{},
    h:{},

    firebaseConfig: {
      apiKey: "AIzaSyDfTlIXEiyVi8aBh6xtNSO0gHO9FiHqjOA",
      authDomain: "quiniela-rusia2018-3d30f.firebaseapp.com",
      databaseURL: "https://quiniela-rusia2018-3d30f.firebaseio.com",
      projectId: "quiniela-rusia2018-3d30f",
      storageBucket: "quiniela-rusia2018-3d30f.appspot.com",
      messagingSenderId: "469652080702"
    },

    groups: function(){
      $("body,html").animate({scrollTop: 0},10);
      var inputs = document.getElementsByClassName("results");
      for (var i=0;i<inputs.length;i++){
        var aux = inputs[i].value.replace(" ","");
        if (aux === "" || aux.match(/[a-z]/i)) {
          $("#myModal1").modal('show');
          return;
        }
      }

      var rus_ars = document.getElementById('rus-ars-1').value+'-'+document.getElementById('rus-ars-2').value;
      var egi_uru = document.getElementById('egi-uru-1').value+'-'+document.getElementById('egi-uru-2').value;
      var rus_egi = document.getElementById('rus-egi-1').value+'-'+document.getElementById('rus-egi-2').value;
      var uru_ars = document.getElementById('uru-ars-1').value+'-'+document.getElementById('uru-ars-2').value;
      var ars_egi = document.getElementById('ars-egi-1').value+'-'+document.getElementById('ars-egi-2').value;
      var uru_rus = document.getElementById('uru-rus-1').value+'-'+document.getElementById('uru-rus-2').value;

      app.a={
        'rus_ars':rus_ars,
        'egi_uru':egi_uru,
        'rus_egi':rus_egi,
        'uru_ars':uru_ars,
        'ars_egi':ars_egi,
        'uru_rus':uru_rus,
        rus:{
          ptos:0,
          gf:0,
          ge:0,
        },
        ars:{
          ptos:0,
          gf:0,
          ge:0,
        },
        egi:{
          ptos:0,
          gf:0,
          ge:0,
        },
        uru:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var mar_ira = document.getElementById('mar-ira-1').value+'-'+document.getElementById('mar-ira-2').value;
      var por_esp = document.getElementById('por-esp-1').value+'-'+document.getElementById('por-esp-2').value;
      var por_mar = document.getElementById('por-mar-1').value+'-'+document.getElementById('por-mar-2').value;
      var ira_esp = document.getElementById('ira-esp-1').value+'-'+document.getElementById('ira-esp-2').value;
      var esp_mar = document.getElementById('esp-mar-1').value+'-'+document.getElementById('esp-mar-2').value;
      var ira_por = document.getElementById('ira-por-1').value+'-'+document.getElementById('ira-por-2').value;

      app.b={
        'mar_ira':mar_ira,
        'por_esp':por_esp,
        'por_mar':por_mar,
        'ira_esp':ira_esp,
        'esp_mar':esp_mar,
        'ira_por':ira_por,
        mar:{
          ptos:0,
          gf:0,
          ge:0,
        },
        ira:{
          ptos:0,
          gf:0,
          ge:0,
        },
        por:{
          ptos:0,
          gf:0,
          ge:0,
        },
        esp:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var fra_aus = document.getElementById('fra-aus-1').value+'-'+document.getElementById('fra-aus-2').value;
      var per_din = document.getElementById('per-din-1').value+'-'+document.getElementById('per-din-2').value;
      var fra_per = document.getElementById('fra-per-1').value+'-'+document.getElementById('fra-per-2').value;
      var din_aus = document.getElementById('din-aus-1').value+'-'+document.getElementById('din-aus-2').value;
      var aus_per = document.getElementById('aus-per-1').value+'-'+document.getElementById('aus-per-2').value;
      var din_fra = document.getElementById('din-fra-1').value+'-'+document.getElementById('din-fra-2').value;

      app.c={
        'fra_aus':fra_aus,
        'per_din':per_din,
        'fra_per':fra_per,
        'din_aus':din_aus,
        'aus_per':aus_per,
        'din_fra':din_fra,
        fra:{
          ptos:0,
          gf:0,
          ge:0,
        },
        aus:{
          ptos:0,
          gf:0,
          ge:0,
        },
        per:{
          ptos:0,
          gf:0,
          ge:0,
        },
        din:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var arg_isl = document.getElementById('arg-isl-1').value+'-'+document.getElementById('arg-isl-2').value;
      var cro_nig = document.getElementById('cro-nig-1').value+'-'+document.getElementById('cro-nig-2').value;
      var arg_cro = document.getElementById('arg-cro-1').value+'-'+document.getElementById('arg-cro-2').value;
      var nig_isl = document.getElementById('nig-isl-1').value+'-'+document.getElementById('nig-isl-2').value;
      var isl_cro = document.getElementById('isl-cro-1').value+'-'+document.getElementById('isl-cro-2').value;
      var nig_arg = document.getElementById('nig-arg-1').value+'-'+document.getElementById('nig-arg-2').value;

      app.d={
        'arg_isl':arg_isl,
        'cro_nig':cro_nig,
        'arg_cro':arg_cro,
        'nig_isl':nig_isl,
        'isl_cro':isl_cro,
        'nig_arg':nig_arg,
        arg:{
          ptos:0,
          gf:0,
          ge:0,
        },
        isl:{
          ptos:0,
          gf:0,
          ge:0,
        },
        cro:{
          ptos:0,
          gf:0,
          ge:0,
        },
        nig:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var cos_ser = document.getElementById('cos-ser-1').value+'-'+document.getElementById('cos-ser-2').value;
      var bra_sui = document.getElementById('bra-sui-1').value+'-'+document.getElementById('bra-sui-2').value;
      var bra_cos = document.getElementById('bra-cos-1').value+'-'+document.getElementById('bra-cos-2').value;
      var ser_sui = document.getElementById('ser-sui-1').value+'-'+document.getElementById('ser-sui-2').value;
      var sui_cos = document.getElementById('sui-cos-1').value+'-'+document.getElementById('sui-cos-2').value;
      var ser_bra = document.getElementById('ser-bra-1').value+'-'+document.getElementById('ser-bra-2').value;

      app.e={
        'cos_ser':cos_ser,
        'bra_sui':bra_sui,
        'bra_cos':bra_cos,
        'ser_sui':ser_sui,
        'sui_cos':sui_cos,
        'ser_bra':ser_bra,
        cos:{
          ptos:0,
          gf:0,
          ge:0,
        },
        ser:{
          ptos:0,
          gf:0,
          ge:0,
        },
        bra:{
          ptos:0,
          gf:0,
          ge:0,
        },
        sui:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var ale_mex = document.getElementById('ale-mex-1').value+'-'+document.getElementById('ale-mex-2').value;
      var sue_cor = document.getElementById('sue-cor-1').value+'-'+document.getElementById('sue-cor-2').value;
      var ale_sue = document.getElementById('ale-sue-1').value+'-'+document.getElementById('ale-sue-2').value;
      var cor_mex = document.getElementById('cor-mex-1').value+'-'+document.getElementById('cor-mex-2').value;
      var mex_sue = document.getElementById('mex-sue-1').value+'-'+document.getElementById('mex-sue-2').value;
      var cor_ale = document.getElementById('cor-ale-1').value+'-'+document.getElementById('cor-ale-2').value;

      app.f={
        'ale_mex':ale_mex,
        'sue_cor':sue_cor,
        'ale_sue':ale_sue,
        'cor_mex':cor_mex,
        'mex_sue':mex_sue,
        'cor_ale':cor_ale,
        ale:{
          ptos:0,
          gf:0,
          ge:0,
        },
        mex:{
          ptos:0,
          gf:0,
          ge:0,
        },
        sue:{
          ptos:0,
          gf:0,
          ge:0,
        },
        cor:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var bel_pan = document.getElementById('bel-pan-1').value+'-'+document.getElementById('bel-pan-2').value;
      var tun_ing = document.getElementById('tun-ing-1').value+'-'+document.getElementById('tun-ing-2').value;
      var bel_tun = document.getElementById('bel-tun-1').value+'-'+document.getElementById('bel-tun-2').value;
      var ing_pan = document.getElementById('ing-pan-1').value+'-'+document.getElementById('ing-pan-2').value;
      var pan_tun = document.getElementById('pan-tun-1').value+'-'+document.getElementById('pan-tun-2').value;
      var ing_bel = document.getElementById('ing-bel-1').value+'-'+document.getElementById('ing-bel-2').value;

      app.g={
        'bel_pan':bel_pan,
        'tun_ing':tun_ing,
        'bel_tun':bel_tun,
        'ing_pan':ing_pan,
        'pan_tun':pan_tun,
        'ing_bel':ing_bel,
        bel:{
          ptos:0,
          gf:0,
          ge:0,
        },
        pan:{
          ptos:0,
          gf:0,
          ge:0,
        },
        tun:{
          ptos:0,
          gf:0,
          ge:0,
        },
        ing:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      var pol_sen = document.getElementById('pol-sen-1').value+'-'+document.getElementById('pol-sen-2').value;
      var col_jap = document.getElementById('col-jap-1').value+'-'+document.getElementById('col-jap-2').value;
      var jap_sen = document.getElementById('jap-sen-1').value+'-'+document.getElementById('jap-sen-2').value;
      var pol_col = document.getElementById('pol-col-1').value+'-'+document.getElementById('pol-col-2').value;
      var sen_col = document.getElementById('sen-col-1').value+'-'+document.getElementById('sen-col-2').value;
      var jap_pol = document.getElementById('jap-pol-1').value+'-'+document.getElementById('jap-pol-2').value;

      app.h={
        'pol_sen':pol_sen,
        'col_jap':col_jap,
        'jap_sen':jap_sen,
        'pol_col':pol_col,
        'sen_col':sen_col,
        'jap_pol':jap_pol,
        pol:{
          ptos:0,
          gf:0,
          ge:0,
        },
        jap:{
          ptos:0,
          gf:0,
          ge:0,
        },
        sen:{
          ptos:0,
          gf:0,
          ge:0,
        },
        col:{
          ptos:0,
          gf:0,
          ge:0,
        },
        primero:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
        segundo:{
          eq:'',
          ptos:0,
          gf:0,
          ge:0,
        },
      }

      app.calculateA();
      app.calculateB();
      app.calculateC();
      app.calculateD();
      app.calculateE();
      app.calculateF();
      app.calculateG();
      app.calculateH();

      document.getElementById("grupos").style.display = "none";
      document.getElementById("eliminatoria").style.display = "inline";
    },

    calculateA:function(){
      app.a['rus']['ptos']=0;
      app.a['ars']['ptos']=0;
      app.a['egi']['ptos']=0;
      app.a['uru']['ptos']=0;

      app.a['rus']['gf'] = 0;
      app.a['rus']['ge'] = 0;

      app.a['ars']['gf'] = 0;
      app.a['ars']['ge'] = 0;

      app.a['egi']['gf'] = 0;
      app.a['egi']['ge'] = 0;

      app.a['uru']['gf'] = 0;
      app.a['uru']['ge'] = 0;

      var res1 = app.a['rus_ars'].split('-');
      if (res1[0] < res1[1]) {
        app.a['ars']['ptos'] += 3;
        app.a['rus']['gf'] += parseInt(res1[0]);
        app.a['rus']['ge'] += parseInt(res1[1]);
        app.a['ars']['gf'] += parseInt(res1[1]);
        app.a['ars']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.a['rus']['ptos'] += 3;
        app.a['rus']['gf'] += parseInt(res1[0]);
        app.a['rus']['ge'] += parseInt(res1[1]);
        app.a['ars']['gf'] += parseInt(res1[1]);
        app.a['ars']['ge'] += parseInt(res1[0]);
      }
      else {
        app.a['rus']['ptos'] += 1;
        app.a['ars']['ptos'] += 1;
        app.a['rus']['gf'] += parseInt(res1[0]);
        app.a['rus']['ge'] += parseInt(res1[1]);
        app.a['ars']['gf'] += parseInt(res1[1]);
        app.a['ars']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.a['egi_uru'].split('-');
      if (res2[0] < res2[1]) {
        app.a['uru']['ptos'] += 3;
        app.a['egi']['gf'] += parseInt(res2[0]);
        app.a['egi']['ge'] += parseInt(res2[1]);
        app.a['uru']['gf'] += parseInt(res2[1]);
        app.a['uru']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.a['egi']['ptos'] += 3;
        app.a['egi']['gf'] += parseInt(res2[0]);
        app.a['egi']['ge'] += parseInt(res2[1]);
        app.a['uru']['gf'] += parseInt(res2[1]);
        app.a['uru']['ge'] += parseInt(res2[0]);
      }
      else {
        app.a['egi']['ptos'] += 1;
        app.a['uru']['ptos'] += 1;
        app.a['egi']['gf'] += parseInt(res2[0]);
        app.a['egi']['ge'] += parseInt(res2[1]);
        app.a['uru']['gf'] += parseInt(res2[1]);
        app.a['uru']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.a['uru_ars'].split('-');
      if (res3[0] > res3[1]) {
        app.a['uru']['ptos'] += 3;
        app.a['uru']['gf'] += parseInt(res3[0]);
        app.a['uru']['ge'] += parseInt(res3[1]);
        app.a['ars']['gf'] += parseInt(res3[1]);
        app.a['ars']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.a['ars']['ptos'] += 3;
        app.a['ars']['gf'] += parseInt(res3[1]);
        app.a['ars']['ge'] += parseInt(res3[0]);
        app.a['uru']['gf'] += parseInt(res3[0]);
        app.a['uru']['ge'] += parseInt(res3[1]);
      }
      else {
        app.a['ars']['ptos'] += 1;
        app.a['uru']['ptos'] += 1;
        app.a['ars']['gf'] += parseInt(res3[1]);
        app.a['ars']['ge'] += parseInt(res3[0]);
        app.a['uru']['gf'] += parseInt(res3[0]);
        app.a['uru']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.a['rus_egi'].split('-');
      if (res4[0] > res4[1]) {
        app.a['rus']['ptos'] += 3;
        app.a['rus']['gf'] += parseInt(res4[0]);
        app.a['rus']['ge'] += parseInt(res4[1]);
        app.a['egi']['gf'] += parseInt(res4[1]);
        app.a['egi']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.a['egi']['ptos'] += 3;
        app.a['egi']['gf'] += parseInt(res4[1]);
        app.a['egi']['ge'] += parseInt(res4[0]);
        app.a['rus']['gf'] += parseInt(res4[0]);
        app.a['rus']['ge'] += parseInt(res4[1]);
      }
      else {
        app.a['egi']['ptos'] += 1;
        app.a['rus']['ptos'] += 1;
        app.a['egi']['gf'] += parseInt(res4[1]);
        app.a['egi']['ge'] += parseInt(res4[0]);
        app.a['rus']['gf'] += parseInt(res4[0]);
        app.a['rus']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.a['ars_egi'].split('-');
      if (res5[0] > res5[1]) {
        app.a['ars']['ptos'] += 3;
        app.a['ars']['gf'] += parseInt(res5[0]);
        app.a['ars']['ge'] += parseInt(res5[1]);
        app.a['egi']['gf'] += parseInt(res5[1]);
        app.a['egi']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.a['egi']['ptos'] += 3;
        app.a['egi']['gf'] += parseInt(res5[1]);
        app.a['egi']['ge'] += parseInt(res5[0]);
        app.a['ars']['gf'] += parseInt(res5[0]);
        app.a['ars']['ge'] += parseInt(res5[1]);
      }
      else {
        app.a['egi']['ptos'] += 1;
        app.a['ars']['ptos'] += 1;
        app.a['egi']['gf'] += parseInt(res5[1]);
        app.a['egi']['ge'] += parseInt(res5[0]);
        app.a['ars']['gf'] += parseInt(res5[0]);
        app.a['ars']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.a['uru_rus'].split('-');
      if (res6[0] > res6[1]) {
        app.a['uru']['ptos'] += 3;
        app.a['uru']['gf'] += parseInt(res6[0]);
        app.a['uru']['ge'] += parseInt(res6[1]);
        app.a['rus']['gf'] += parseInt(res6[1]);
        app.a['rus']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.a['rus']['ptos'] += 3;
        app.a['rus']['gf'] += parseInt(res6[1]);
        app.a['rus']['ge'] += parseInt(res6[0]);
        app.a['uru']['gf'] += parseInt(res6[0]);
        app.a['uru']['ge'] += parseInt(res6[1]);
      }
      else {
        app.a['rus']['ptos'] += 1;
        app.a['uru']['ptos'] += 1;
        app.a['rus']['gf'] += parseInt(res6[1]);
        app.a['rus']['ge'] += parseInt(res6[0]);
        app.a['uru']['gf'] += parseInt(res6[0]);
        app.a['uru']['ge'] += parseInt(res6[1]);
      }

      if (app.a['primero']['ptos'] < app.a['egi']['ptos']) {
        app.a['primero']['eq'] = 'Egipto';
        app.a['primero']['ptos'] = app.a['egi']['ptos'];
        app.a['primero']['gf'] = app.a['egi']['gf'];
        app.a['primero']['ge'] = app.a['egi']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.a['primero']['ptos'] < app.a['rus']['ptos']) {
        app.a['segundo']['eq'] = app.a['primero']['eq'];
        app.a['segundo']['ptos'] = app.a['primero']['ptos'];
        app.a['segundo']['gf'] = app.a['primero']['gf'];
        app.a['segundo']['ge'] = app.a['primero']['ge'];
        app.a['primero']['eq'] = 'Rusia';
        app.a['primero']['ptos'] = app.a['rus']['ptos'];
        app.a['primero']['gf'] = app.a['rus']['gf'];
        app.a['primero']['ge'] = app.a['rus']['ge'];
      }
      else if (app.a['primero']['ptos'] == app.a['rus']['ptos']) {
        var difp = app.a['primero']['gf']-app.a['primero']['ge'];
        var difs = app.a['rus']['gf']-app.a['rus']['ge'];
        if (difp > difs) {
          app.a['segundo']['eq'] = 'Rusia';
          app.a['segundo']['ptos'] = app.a['rus']['ptos'];
          app.a['segundo']['gf'] = app.a['rus']['gf'];
          app.a['segundo']['ge'] = app.a['rus']['ge'];
        }
        else if (difp < difs) {
          app.a['segundo']['eq'] = app.a['primero']['eq'];
          app.a['segundo']['ptos'] = app.a['primero']['ptos'];
          app.a['segundo']['gf'] = app.a['primero']['gf'];
          app.a['segundo']['ge'] = app.a['primero']['ge'];
          app.a['primero']['eq'] = 'Rusia';
          app.a['primero']['ptos'] = app.a['rus']['ptos'];
          app.a['primero']['gf'] = app.a['rus']['gf'];
          app.a['primero']['ge'] = app.a['rus']['ge'];      
        }
        else{
          if (app.a['primero']['gf'] > app.a['rus']['gf']) {
            app.a['segundo']['eq'] = 'Rusia';
            app.a['segundo']['ptos'] = app.a['rus']['ptos'];
            app.a['segundo']['gf'] = app.a['rus']['gf'];
            app.a['segundo']['ge'] = app.a['rus']['ge'];
          }
          else{
            app.a['segundo']['eq'] = app.a['primero']['eq'];
            app.a['segundo']['ptos'] = app.a['primero']['ptos'];
            app.a['segundo']['gf'] = app.a['primero']['gf'];
            app.a['segundo']['ge'] = app.a['primero']['ge'];
            app.a['primero']['eq'] = 'Rusia';
            app.a['primero']['ptos'] = app.a['rus']['ptos'];
            app.a['primero']['gf'] = app.a['rus']['gf'];
            app.a['primero']['ge'] = app.a['rus']['ge']; 
          }
        }
      }
      else{
        app.a['segundo']['eq'] = 'Rusia';
        app.a['segundo']['ptos'] = app.a['rus']['ptos'];
        app.a['segundo']['gf'] = app.a['rus']['gf'];
        app.a['segundo']['ge'] = app.a['rus']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.a['primero']['ptos'] < app.a['ars']['ptos']) {
        app.a['segundo']['eq'] = app.a['primero']['eq'];
        app.a['segundo']['ptos'] = app.a['primero']['ptos'];
        app.a['segundo']['gf'] = app.a['primero']['gf'];
        app.a['segundo']['ge'] = app.a['primero']['ge'];
        app.a['primero']['eq'] = 'Arabia Saudita';
        app.a['primero']['ptos'] = app.a['ars']['ptos'];
        app.a['primero']['gf'] = app.a['ars']['gf'];
        app.a['primero']['ge'] = app.a['ars']['ge'];
      }
      else if (app.a['primero']['ptos'] == app.a['ars']['ptos']) {
        var difp = app.a['primero']['gf']-app.a['primero']['ge'];
        var difs = app.a['ars']['gf']-app.a['ars']['ge'];
        if (difp > difs) {
          app.a['segundo']['eq'] = 'Arabia Saudita';
          app.a['segundo']['ptos'] = app.a['ars']['ptos'];
          app.a['segundo']['gf'] = app.a['ars']['gf'];
          app.a['segundo']['ge'] = app.a['ars']['ge'];
        }
        else if (difp < difs) {
          app.a['segundo']['eq'] = app.a['primero']['eq'];
          app.a['segundo']['ptos'] = app.a['primero']['ptos'];
          app.a['segundo']['gf'] = app.a['primero']['gf'];
          app.a['segundo']['ge'] = app.a['primero']['ge'];
          app.a['primero']['eq'] = 'Arabia Saudita';
          app.a['primero']['ptos'] = app.a['ars']['ptos'];
          app.a['primero']['gf'] = app.a['ars']['gf'];
          app.a['primero']['ge'] = app.a['ars']['ge'];      
        }
        else{
          if (app.a['primero']['gf'] > app.a['ars']['gf']) {
            app.a['segundo']['eq'] = 'Arabia Saudita';
            app.a['segundo']['ptos'] = app.a['ars']['ptos'];
            app.a['segundo']['gf'] = app.a['ars']['gf'];
            app.a['segundo']['ge'] = app.a['ars']['ge'];
          }
          else{
            app.a['segundo']['eq'] = app.a['primero']['eq'];
            app.a['segundo']['ptos'] = app.a['primero']['ptos'];
            app.a['segundo']['gf'] = app.a['primero']['gf'];
            app.a['segundo']['ge'] = app.a['primero']['ge'];
            app.a['primero']['eq'] = 'Arabia Saudita';
            app.a['primero']['ptos'] = app.a['ars']['ptos'];
            app.a['primero']['gf'] = app.a['ars']['gf'];
            app.a['primero']['ge'] = app.a['ars']['ge']; 
          }
        }
      }
      else{
        if (app.a['segundo']['ptos'] < app.a['ars']['ptos']) {
          app.a['segundo']['eq'] = 'Arabia Saudita';
          app.a['segundo']['ptos'] = app.a['ars']['ptos'];
          app.a['segundo']['gf'] = app.a['ars']['gf'];
          app.a['segundo']['ge'] = app.a['ars']['ge'];
        }
        else if (app.a['segundo']['ptos'] == app.a['ars']['ptos']) {
          var difp = app.a['segundo']['gf']-app.a['segundo']['ge'];
          var difs = app.a['ars']['gf']-app.a['ars']['ge'];
          if (difp < difs) {
            app.a['segundo']['eq'] = 'Arabia Saudita';
            app.a['segundo']['ptos'] = app.a['ars']['ptos'];
            app.a['segundo']['gf'] = app.a['ars']['gf'];
            app.a['segundo']['ge'] = app.a['ars']['ge'];
          }
          else if (difp == difs) {
            if (app.a['segundo']['gf'] < app.a['ars']['gf']) {
              app.a['segundo']['eq'] = 'Arabia Saudita';
              app.a['segundo']['ptos'] = app.a['ars']['ptos'];
              app.a['segundo']['gf'] = app.a['ars']['gf'];
              app.a['segundo']['ge'] = app.a['ars']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.a['primero']['ptos'] < app.a['uru']['ptos']) {
        app.a['segundo']['eq'] = app.a['primero']['eq'];
        app.a['segundo']['ptos'] = app.a['primero']['ptos'];
        app.a['segundo']['gf'] = app.a['primero']['gf'];
        app.a['segundo']['ge'] = app.a['primero']['ge'];
        app.a['primero']['eq'] = 'Uruguay';
        app.a['primero']['ptos'] = app.a['uru']['ptos'];
        app.a['primero']['gf'] = app.a['uru']['gf'];
        app.a['primero']['ge'] = app.a['uru']['ge'];
      }
      else if (app.a['primero']['ptos'] == app.a['uru']['ptos']) {
        var difp = app.a['primero']['gf']-app.a['primero']['ge'];
        var difs = app.a['uru']['gf']-app.a['uru']['ge'];
        if (difp > difs) {
          app.a['segundo']['eq'] = 'Uruguay';
          app.a['segundo']['ptos'] = app.a['uru']['ptos'];
          app.a['segundo']['gf'] = app.a['uru']['gf'];
          app.a['segundo']['ge'] = app.a['uru']['ge'];
        }
        else if (difp < difs) {
          app.a['segundo']['eq'] = app.a['primero']['eq'];
          app.a['segundo']['ptos'] = app.a['primero']['ptos'];
          app.a['segundo']['gf'] = app.a['primero']['gf'];
          app.a['segundo']['ge'] = app.a['primero']['ge'];
          app.a['primero']['eq'] = 'Uruguay';
          app.a['primero']['ptos'] = app.a['uru']['ptos'];
          app.a['primero']['gf'] = app.a['uru']['gf'];
          app.a['primero']['ge'] = app.a['uru']['ge'];      
        }
        else{
          if (app.a['primero']['gf'] > app.a['uru']['gf']) {
            app.a['segundo']['eq'] = 'Uruguay';
            app.a['segundo']['ptos'] = app.a['uru']['ptos'];
            app.a['segundo']['gf'] = app.a['uru']['gf'];
            app.a['segundo']['ge'] = app.a['uru']['ge'];
          }
          else{
            app.a['segundo']['eq'] = app.a['primero']['eq'];
            app.a['segundo']['ptos'] = app.a['primero']['ptos'];
            app.a['segundo']['gf'] = app.a['primero']['gf'];
            app.a['segundo']['ge'] = app.a['primero']['ge'];
            app.a['primero']['eq'] = 'Uruguay';
            app.a['primero']['ptos'] = app.a['uru']['ptos'];
            app.a['primero']['gf'] = app.a['uru']['gf'];
            app.a['primero']['ge'] = app.a['uru']['ge']; 
          }
        }
      }
      else{
        if (app.a['segundo']['ptos'] < app.a['uru']['ptos']) {
          app.a['segundo']['eq'] = 'Uruguay';
          app.a['segundo']['ptos'] = app.a['uru']['ptos'];
          app.a['segundo']['gf'] = app.a['uru']['gf'];
          app.a['segundo']['ge'] = app.a['uru']['ge'];
        }
        else if (app.a['segundo']['ptos'] == app.a['uru']['ptos']) {
          var difp = app.a['segundo']['gf']-app.a['segundo']['ge'];
          var difs = app.a['uru']['gf']-app.a['uru']['ge'];
          if (difp < difs) {
            app.a['segundo']['eq'] = 'Uruguay';
            app.a['segundo']['ptos'] = app.a['uru']['ptos'];
            app.a['segundo']['gf'] = app.a['uru']['gf'];
            app.a['segundo']['ge'] = app.a['uru']['ge'];
          }
          else if (difp == difs) {
            if (app.a['segundo']['gf'] < app.a['uru']['gf']) {
              app.a['segundo']['eq'] = 'Uruguay';
              app.a['segundo']['ptos'] = app.a['uru']['ptos'];
              app.a['segundo']['gf'] = app.a['uru']['gf'];
              app.a['segundo']['ge'] = app.a['uru']['ge'];
            }
          }
        }
      }

      document.getElementById('1a').value = app.a['primero']['eq'];
      document.getElementById('2a').value = app.a['segundo']['eq'];
    },

    calculateB:function(){
      app.b['mar']['ptos']=0;
      app.b['ira']['ptos']=0;
      app.b['por']['ptos']=0;
      app.b['esp']['ptos']=0;

      app.b['mar']['gf'] = 0;
      app.b['mar']['ge'] = 0;

      app.b['ira']['gf'] = 0;
      app.b['ira']['ge'] = 0;

      app.b['por']['gf'] = 0;
      app.b['por']['ge'] = 0;

      app.b['esp']['gf'] = 0;
      app.b['esp']['ge'] = 0;

      var res1 = app.b['mar_ira'].split('-');
      if (res1[0] < res1[1]) {
        app.b['ira']['ptos'] += 3;
        app.b['mar']['gf'] += parseInt(res1[0]);
        app.b['mar']['ge'] += parseInt(res1[1]);
        app.b['ira']['gf'] += parseInt(res1[1]);
        app.b['ira']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.b['mar']['ptos'] += 3;
        app.b['mar']['gf'] += parseInt(res1[0]);
        app.b['mar']['ge'] += parseInt(res1[1]);
        app.b['ira']['gf'] += parseInt(res1[1]);
        app.b['ira']['ge'] += parseInt(res1[0]);
      }
      else {
        app.b['mar']['ptos'] += 1;
        app.b['ira']['ptos'] += 1;
        app.b['mar']['gf'] += parseInt(res1[0]);
        app.b['mar']['ge'] += parseInt(res1[1]);
        app.b['ira']['gf'] += parseInt(res1[1]);
        app.b['ira']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.b['por_esp'].split('-');
      if (res2[0] < res2[1]) {
        app.b['esp']['ptos'] += 3;
        app.b['por']['gf'] += parseInt(res2[0]);
        app.b['por']['ge'] += parseInt(res2[1]);
        app.b['esp']['gf'] += parseInt(res2[1]);
        app.b['esp']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.b['por']['ptos'] += 3;
        app.b['por']['gf'] += parseInt(res2[0]);
        app.b['por']['ge'] += parseInt(res2[1]);
        app.b['esp']['gf'] += parseInt(res2[1]);
        app.b['esp']['ge'] += parseInt(res2[0]);
      }
      else {
        app.b['por']['ptos'] += 1;
        app.b['esp']['ptos'] += 1;
        app.b['por']['gf'] += parseInt(res2[0]);
        app.b['por']['ge'] += parseInt(res2[1]);
        app.b['esp']['gf'] += parseInt(res2[1]);
        app.b['esp']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.b['ira_esp'].split('-');
      if (res3[0] > res3[1]) {
        app.b['ira']['ptos'] += 3;
        app.b['ira']['gf'] += parseInt(res3[0]);
        app.b['ira']['ge'] += parseInt(res3[1]);
        app.b['esp']['gf'] += parseInt(res3[1]);
        app.b['esp']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.b['esp']['ptos'] += 3;
        app.b['esp']['gf'] += parseInt(res3[1]);
        app.b['esp']['ge'] += parseInt(res3[0]);
        app.b['ira']['gf'] += parseInt(res3[0]);
        app.b['ira']['ge'] += parseInt(res3[1]);
      }
      else {
        app.b['esp']['ptos'] += 1;
        app.b['ira']['ptos'] += 1;
        app.b['esp']['gf'] += parseInt(res3[1]);
        app.b['esp']['ge'] += parseInt(res3[0]);
        app.b['ira']['gf'] += parseInt(res3[0]);
        app.b['ira']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.b['por_mar'].split('-');
      if (res4[0] > res4[1]) {
        app.b['por']['ptos'] += 3;
        app.b['por']['gf'] += parseInt(res4[0]);
        app.b['por']['ge'] += parseInt(res4[1]);
        app.b['mar']['gf'] += parseInt(res4[1]);
        app.b['mar']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.b['mar']['ptos'] += 3;
        app.b['mar']['gf'] += parseInt(res4[1]);
        app.b['mar']['ge'] += parseInt(res4[0]);
        app.b['por']['gf'] += parseInt(res4[0]);
        app.b['por']['ge'] += parseInt(res4[1]);
      }
      else {
        app.b['mar']['ptos'] += 1;
        app.b['por']['ptos'] += 1;
        app.b['mar']['gf'] += parseInt(res4[1]);
        app.b['mar']['ge'] += parseInt(res4[0]);
        app.b['por']['gf'] += parseInt(res4[0]);
        app.b['por']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.b['ira_por'].split('-');
      if (res5[0] > res5[1]) {
        app.b['ira']['ptos'] += 3;
        app.b['ira']['gf'] += parseInt(res5[0]);
        app.b['ira']['ge'] += parseInt(res5[1]);
        app.b['por']['gf'] += parseInt(res5[1]);
        app.b['por']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.b['por']['ptos'] += 3;
        app.b['por']['gf'] += parseInt(res5[1]);
        app.b['por']['ge'] += parseInt(res5[0]);
        app.b['ira']['gf'] += parseInt(res5[0]);
        app.b['ira']['ge'] += parseInt(res5[1]);
      }
      else {
        app.b['por']['ptos'] += 1;
        app.b['ira']['ptos'] += 1;
        app.b['por']['gf'] += parseInt(res5[1]);
        app.b['por']['ge'] += parseInt(res5[0]);
        app.b['ira']['gf'] += parseInt(res5[0]);
        app.b['ira']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.b['esp_mar'].split('-');
      if (res6[0] > res6[1]) {
        app.b['esp']['ptos'] += 3;
        app.b['esp']['gf'] += parseInt(res6[0]);
        app.b['esp']['ge'] += parseInt(res6[1]);
        app.b['mar']['gf'] += parseInt(res6[1]);
        app.b['mar']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.b['mar']['ptos'] += 3;
        app.b['mar']['gf'] += parseInt(res6[1]);
        app.b['mar']['ge'] += parseInt(res6[0]);
        app.b['esp']['gf'] += parseInt(res6[0]);
        app.b['esp']['ge'] += parseInt(res6[1]);
      }
      else {
        app.b['mar']['ptos'] += 1;
        app.b['esp']['ptos'] += 1;
        app.b['mar']['gf'] += parseInt(res6[1]);
        app.b['mar']['ge'] += parseInt(res6[0]);
        app.b['esp']['gf'] += parseInt(res6[0]);
        app.b['esp']['ge'] += parseInt(res6[1]);
      }

      if (app.b['primero']['ptos'] < app.b['por']['ptos']) {
        app.b['primero']['eq'] = 'Portugal';
        app.b['primero']['ptos'] = app.b['por']['ptos'];
        app.b['primero']['gf'] = app.b['por']['gf'];
        app.b['primero']['ge'] = app.b['por']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.b['primero']['ptos'] < app.b['mar']['ptos']) {
        app.b['segundo']['eq'] = app.b['primero']['eq'];
        app.b['segundo']['ptos'] = app.b['primero']['ptos'];
        app.b['segundo']['gf'] = app.b['primero']['gf'];
        app.b['segundo']['ge'] = app.b['primero']['ge'];
        app.b['primero']['eq'] = 'Marruecos';
        app.b['primero']['ptos'] = app.b['mar']['ptos'];
        app.b['primero']['gf'] = app.b['mar']['gf'];
        app.b['primero']['ge'] = app.b['mar']['ge'];
      }
      else if (app.b['primero']['ptos'] == app.b['mar']['ptos']) {
        var difp = app.b['primero']['gf']-app.b['primero']['ge'];
        var difs = app.b['mar']['gf']-app.b['mar']['ge'];
        if (difp > difs) {
          app.b['segundo']['eq'] = 'Marruecos';
          app.b['segundo']['ptos'] = app.b['mar']['ptos'];
          app.b['segundo']['gf'] = app.b['mar']['gf'];
          app.b['segundo']['ge'] = app.b['mar']['ge'];
        }
        else if (difp < difs) {
          app.b['segundo']['eq'] = app.b['primero']['eq'];
          app.b['segundo']['ptos'] = app.b['primero']['ptos'];
          app.b['segundo']['gf'] = app.b['primero']['gf'];
          app.b['segundo']['ge'] = app.b['primero']['ge'];
          app.b['primero']['eq'] = 'Marruecos';
          app.b['primero']['ptos'] = app.b['mar']['ptos'];
          app.b['primero']['gf'] = app.b['mar']['gf'];
          app.b['primero']['ge'] = app.b['mar']['ge'];      
        }
        else{
          if (app.b['primero']['gf'] > app.b['mar']['gf']) {
            app.b['segundo']['eq'] = 'Marruecos';
            app.b['segundo']['ptos'] = app.b['mar']['ptos'];
            app.b['segundo']['gf'] = app.b['mar']['gf'];
            app.b['segundo']['ge'] = app.b['mar']['ge'];
          }
          else{
            app.b['segundo']['eq'] = app.b['primero']['eq'];
            app.b['segundo']['ptos'] = app.b['primero']['ptos'];
            app.b['segundo']['gf'] = app.b['primero']['gf'];
            app.b['segundo']['ge'] = app.b['primero']['ge'];
            app.b['primero']['eq'] = 'Marruecos';
            app.b['primero']['ptos'] = app.b['mar']['ptos'];
            app.b['primero']['gf'] = app.b['mar']['gf'];
            app.b['primero']['ge'] = app.b['mar']['ge']; 
          }
        }
      }
      else{
        app.b['segundo']['eq'] = 'Marruecos';
        app.b['segundo']['ptos'] = app.b['mar']['ptos'];
        app.b['segundo']['gf'] = app.b['mar']['gf'];
        app.b['segundo']['ge'] = app.b['mar']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.b['primero']['ptos'] < app.b['ira']['ptos']) {
        app.b['segundo']['eq'] = app.b['primero']['eq'];
        app.b['segundo']['ptos'] = app.b['primero']['ptos'];
        app.b['segundo']['gf'] = app.b['primero']['gf'];
        app.b['segundo']['ge'] = app.b['primero']['ge'];
        app.b['primero']['eq'] = 'Irán';
        app.b['primero']['ptos'] = app.b['ira']['ptos'];
        app.b['primero']['gf'] = app.b['ira']['gf'];
        app.b['primero']['ge'] = app.b['ira']['ge'];
      }
      else if (app.b['primero']['ptos'] == app.b['ira']['ptos']) {
        var difp = app.b['primero']['gf']-app.b['primero']['ge'];
        var difs = app.b['ira']['gf']-app.b['ira']['ge'];
        if (difp > difs) {
          app.b['segundo']['eq'] = 'Irán';
          app.b['segundo']['ptos'] = app.b['ira']['ptos'];
          app.b['segundo']['gf'] = app.b['ira']['gf'];
          app.b['segundo']['ge'] = app.b['ira']['ge'];
        }
        else if (difp < difs) {
          app.b['segundo']['eq'] = app.b['primero']['eq'];
          app.b['segundo']['ptos'] = app.b['primero']['ptos'];
          app.b['segundo']['gf'] = app.b['primero']['gf'];
          app.b['segundo']['ge'] = app.b['primero']['ge'];
          app.b['primero']['eq'] = 'Irán';
          app.b['primero']['ptos'] = app.b['ira']['ptos'];
          app.b['primero']['gf'] = app.b['ira']['gf'];
          app.b['primero']['ge'] = app.b['ira']['ge'];      
        }
        else{
          if (app.b['primero']['gf'] > app.b['ira']['gf']) {
            app.b['segundo']['eq'] = 'Irán';
            app.b['segundo']['ptos'] = app.b['ira']['ptos'];
            app.b['segundo']['gf'] = app.b['ira']['gf'];
            app.b['segundo']['ge'] = app.b['ira']['ge'];
          }
          else{
            app.b['segundo']['eq'] = app.b['primero']['eq'];
            app.b['segundo']['ptos'] = app.b['primero']['ptos'];
            app.b['segundo']['gf'] = app.b['primero']['gf'];
            app.b['segundo']['ge'] = app.b['primero']['ge'];
            app.b['primero']['eq'] = 'Irán';
            app.b['primero']['ptos'] = app.b['ira']['ptos'];
            app.b['primero']['gf'] = app.b['ira']['gf'];
            app.b['primero']['ge'] = app.b['ira']['ge']; 
          }
        }
      }
      else{
        if (app.b['segundo']['ptos'] < app.b['ira']['ptos']) {
          app.b['segundo']['eq'] = 'Irán';
          app.b['segundo']['ptos'] = app.b['ira']['ptos'];
          app.b['segundo']['gf'] = app.b['ira']['gf'];
          app.b['segundo']['ge'] = app.b['ira']['ge'];
        }
        else if (app.b['segundo']['ptos'] == app.b['ira']['ptos']) {
          var difp = app.b['segundo']['gf']-app.b['segundo']['ge'];
          var difs = app.b['ira']['gf']-app.b['ira']['ge'];
          if (difp < difs) {
            app.b['segundo']['eq'] = 'Irán';
            app.b['segundo']['ptos'] = app.b['ira']['ptos'];
            app.b['segundo']['gf'] = app.b['ira']['gf'];
            app.b['segundo']['ge'] = app.b['ira']['ge'];
          }
          else if (difp == difs) {
            if (app.b['segundo']['gf'] < app.b['ira']['gf']) {
              app.b['segundo']['eq'] = 'Irán';
              app.b['segundo']['ptos'] = app.b['ira']['ptos'];
              app.b['segundo']['gf'] = app.b['ira']['gf'];
              app.b['segundo']['ge'] = app.b['ira']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.b['primero']['ptos'] < app.b['esp']['ptos']) {
        app.b['segundo']['eq'] = app.b['primero']['eq'];
        app.b['segundo']['ptos'] = app.b['primero']['ptos'];
        app.b['segundo']['gf'] = app.b['primero']['gf'];
        app.b['segundo']['ge'] = app.b['primero']['ge'];
        app.b['primero']['eq'] = 'España';
        app.b['primero']['ptos'] = app.b['esp']['ptos'];
        app.b['primero']['gf'] = app.b['esp']['gf'];
        app.b['primero']['ge'] = app.b['esp']['ge'];
      }
      else if (app.b['primero']['ptos'] == app.b['esp']['ptos']) {
        var difp = app.b['primero']['gf']-app.b['primero']['ge'];
        var difs = app.b['esp']['gf']-app.b['esp']['ge'];
        if (difp > difs) {
          app.b['segundo']['eq'] = 'España';
          app.b['segundo']['ptos'] = app.b['esp']['ptos'];
          app.b['segundo']['gf'] = app.b['esp']['gf'];
          app.b['segundo']['ge'] = app.b['esp']['ge'];
        }
        else if (difp < difs) {
          app.b['segundo']['eq'] = app.b['primero']['eq'];
          app.b['segundo']['ptos'] = app.b['primero']['ptos'];
          app.b['segundo']['gf'] = app.b['primero']['gf'];
          app.b['segundo']['ge'] = app.b['primero']['ge'];
          app.b['primero']['eq'] = 'España';
          app.b['primero']['ptos'] = app.b['esp']['ptos'];
          app.b['primero']['gf'] = app.b['esp']['gf'];
          app.b['primero']['ge'] = app.b['esp']['ge'];      
        }
        else{
          if (app.b['primero']['gf'] > app.b['esp']['gf']) {
            app.b['segundo']['eq'] = 'España';
            app.b['segundo']['ptos'] = app.b['esp']['ptos'];
            app.b['segundo']['gf'] = app.b['esp']['gf'];
            app.b['segundo']['ge'] = app.b['esp']['ge'];
          }
          else{
            app.b['segundo']['eq'] = app.b['primero']['eq'];
            app.b['segundo']['ptos'] = app.b['primero']['ptos'];
            app.b['segundo']['gf'] = app.b['primero']['gf'];
            app.b['segundo']['ge'] = app.b['primero']['ge'];
            app.b['primero']['eq'] = 'España';
            app.b['primero']['ptos'] = app.b['esp']['ptos'];
            app.b['primero']['gf'] = app.b['esp']['gf'];
            app.b['primero']['ge'] = app.b['esp']['ge']; 
          }
        }
      }
      else{
        if (app.b['segundo']['ptos'] < app.b['esp']['ptos']) {
          app.b['segundo']['eq'] = 'España';
          app.b['segundo']['ptos'] = app.b['esp']['ptos'];
          app.b['segundo']['gf'] = app.b['esp']['gf'];
          app.b['segundo']['ge'] = app.b['esp']['ge'];
        }
        else if (app.b['segundo']['ptos'] == app.b['esp']['ptos']) {
          var difp = app.b['segundo']['gf']-app.b['segundo']['ge'];
          var difs = app.b['esp']['gf']-app.b['esp']['ge'];
          if (difp < difs) {
            app.b['segundo']['eq'] = 'España';
            app.b['segundo']['ptos'] = app.b['esp']['ptos'];
            app.b['segundo']['gf'] = app.b['esp']['gf'];
            app.b['segundo']['ge'] = app.b['esp']['ge'];
          }
          else if (difp == difs) {
            if (app.b['segundo']['gf'] < app.b['esp']['gf']) {
              app.b['segundo']['eq'] = 'España';
              app.b['segundo']['ptos'] = app.b['esp']['ptos'];
              app.b['segundo']['gf'] = app.b['esp']['gf'];
              app.b['segundo']['ge'] = app.b['esp']['ge'];
            }
          }
        }
      }

      document.getElementById('1b').value = app.b['primero']['eq'];
      document.getElementById('2b').value = app.b['segundo']['eq'];
    },

    calculateC:function(){
      app.c['fra']['ptos']=0;
      app.c['aus']['ptos']=0;
      app.c['per']['ptos']=0;
      app.c['din']['ptos']=0;

      app.c['fra']['gf'] = 0;
      app.c['fra']['ge'] = 0;

      app.c['aus']['gf'] = 0;
      app.c['aus']['ge'] = 0;

      app.c['per']['gf'] = 0;
      app.c['per']['ge'] = 0;

      app.c['din']['gf'] = 0;
      app.c['din']['ge'] = 0;

      var res1 = app.c['fra_aus'].split('-');
      if (res1[0] < res1[1]) {
        app.c['aus']['ptos'] += 3;
        app.c['fra']['gf'] += parseInt(res1[0]);
        app.c['fra']['ge'] += parseInt(res1[1]);
        app.c['aus']['gf'] += parseInt(res1[1]);
        app.c['aus']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.c['fra']['ptos'] += 3;
        app.c['fra']['gf'] += parseInt(res1[0]);
        app.c['fra']['ge'] += parseInt(res1[1]);
        app.c['aus']['gf'] += parseInt(res1[1]);
        app.c['aus']['ge'] += parseInt(res1[0]);
      }
      else {
        app.c['fra']['ptos'] += 1;
        app.c['aus']['ptos'] += 1;
        app.c['fra']['gf'] += parseInt(res1[0]);
        app.c['fra']['ge'] += parseInt(res1[1]);
        app.c['aus']['gf'] += parseInt(res1[1]);
        app.c['aus']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.c['per_din'].split('-');
      if (res2[0] < res2[1]) {
        app.c['din']['ptos'] += 3;
        app.c['per']['gf'] += parseInt(res2[0]);
        app.c['per']['ge'] += parseInt(res2[1]);
        app.c['din']['gf'] += parseInt(res2[1]);
        app.c['din']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.c['per']['ptos'] += 3;
        app.c['per']['gf'] += parseInt(res2[0]);
        app.c['per']['ge'] += parseInt(res2[1]);
        app.c['din']['gf'] += parseInt(res2[1]);
        app.c['din']['ge'] += parseInt(res2[0]);
      }
      else {
        app.c['per']['ptos'] += 1;
        app.c['din']['ptos'] += 1;
        app.c['per']['gf'] += parseInt(res2[0]);
        app.c['per']['ge'] += parseInt(res2[1]);
        app.c['din']['gf'] += parseInt(res2[1]);
        app.c['din']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.c['din_aus'].split('-');
      if (res3[0] > res3[1]) {
        app.c['din']['ptos'] += 3;
        app.c['din']['gf'] += parseInt(res3[0]);
        app.c['din']['ge'] += parseInt(res3[1]);
        app.c['aus']['gf'] += parseInt(res3[1]);
        app.c['aus']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.c['aus']['ptos'] += 3;
        app.c['aus']['gf'] += parseInt(res3[1]);
        app.c['aus']['ge'] += parseInt(res3[0]);
        app.c['din']['gf'] += parseInt(res3[0]);
        app.c['din']['ge'] += parseInt(res3[1]);
      }
      else {
        app.c['aus']['ptos'] += 1;
        app.c['din']['ptos'] += 1;
        app.c['aus']['gf'] += parseInt(res3[1]);
        app.c['aus']['ge'] += parseInt(res3[0]);
        app.c['din']['gf'] += parseInt(res3[0]);
        app.c['din']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.c['fra_per'].split('-');
      if (res4[0] > res4[1]) {
        app.c['fra']['ptos'] += 3;
        app.c['fra']['gf'] += parseInt(res4[0]);
        app.c['fra']['ge'] += parseInt(res4[1]);
        app.c['per']['gf'] += parseInt(res4[1]);
        app.c['per']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.c['per']['ptos'] += 3;
        app.c['per']['gf'] += parseInt(res4[1]);
        app.c['per']['ge'] += parseInt(res4[0]);
        app.c['fra']['gf'] += parseInt(res4[0]);
        app.c['fra']['ge'] += parseInt(res4[1]);
      }
      else {
        app.c['per']['ptos'] += 1;
        app.c['fra']['ptos'] += 1;
        app.c['per']['gf'] += parseInt(res4[1]);
        app.c['per']['ge'] += parseInt(res4[0]);
        app.c['fra']['gf'] += parseInt(res4[0]);
        app.c['fra']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.c['aus_per'].split('-');
      if (res5[0] > res5[1]) {
        app.c['aus']['ptos'] += 3;
        app.c['aus']['gf'] += parseInt(res5[0]);
        app.c['aus']['ge'] += parseInt(res5[1]);
        app.c['per']['gf'] += parseInt(res5[1]);
        app.c['per']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.c['per']['ptos'] += 3;
        app.c['per']['gf'] += parseInt(res5[1]);
        app.c['per']['ge'] += parseInt(res5[0]);
        app.c['aus']['gf'] += parseInt(res5[0]);
        app.c['aus']['ge'] += parseInt(res5[1]);
      }
      else {
        app.c['per']['ptos'] += 1;
        app.c['aus']['ptos'] += 1;
        app.c['per']['gf'] += parseInt(res5[1]);
        app.c['per']['ge'] += parseInt(res5[0]);
        app.c['aus']['gf'] += parseInt(res5[0]);
        app.c['aus']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.c['din_fra'].split('-');
      if (res6[0] > res6[1]) {
        app.c['din']['ptos'] += 3;
        app.c['din']['gf'] += parseInt(res6[0]);
        app.c['din']['ge'] += parseInt(res6[1]);
        app.c['fra']['gf'] += parseInt(res6[1]);
        app.c['fra']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.c['fra']['ptos'] += 3;
        app.c['fra']['gf'] += parseInt(res6[1]);
        app.c['fra']['ge'] += parseInt(res6[0]);
        app.c['din']['gf'] += parseInt(res6[0]);
        app.c['din']['ge'] += parseInt(res6[1]);
      }
      else {
        app.c['fra']['ptos'] += 1;
        app.c['din']['ptos'] += 1;
        app.c['fra']['gf'] += parseInt(res6[1]);
        app.c['fra']['ge'] += parseInt(res6[0]);
        app.c['din']['gf'] += parseInt(res6[0]);
        app.c['din']['ge'] += parseInt(res6[1]);
      }

      if (app.c['primero']['ptos'] < app.c['per']['ptos']) {
        app.c['primero']['eq'] = 'Perú';
        app.c['primero']['ptos'] = app.c['per']['ptos'];
        app.c['primero']['gf'] = app.c['per']['gf'];
        app.c['primero']['ge'] = app.c['per']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.c['primero']['ptos'] < app.c['fra']['ptos']) {
        app.c['segundo']['eq'] = app.c['primero']['eq'];
        app.c['segundo']['ptos'] = app.c['primero']['ptos'];
        app.c['segundo']['gf'] = app.c['primero']['gf'];
        app.c['segundo']['ge'] = app.c['primero']['ge'];
        app.c['primero']['eq'] = 'Francia';
        app.c['primero']['ptos'] = app.c['fra']['ptos'];
        app.c['primero']['gf'] = app.c['fra']['gf'];
        app.c['primero']['ge'] = app.c['fra']['ge'];
      }
      else if (app.c['primero']['ptos'] == app.c['fra']['ptos']) {
        var difp = app.c['primero']['gf']-app.c['primero']['ge'];
        var difs = app.c['fra']['gf']-app.c['fra']['ge'];
        if (difp > difs) {
          app.c['segundo']['eq'] = 'Francia';
          app.c['segundo']['ptos'] = app.c['fra']['ptos'];
          app.c['segundo']['gf'] = app.c['fra']['gf'];
          app.c['segundo']['ge'] = app.c['fra']['ge'];
        }
        else if (difp < difs) {
          app.c['segundo']['eq'] = app.c['primero']['eq'];
          app.c['segundo']['ptos'] = app.c['primero']['ptos'];
          app.c['segundo']['gf'] = app.c['primero']['gf'];
          app.c['segundo']['ge'] = app.c['primero']['ge'];
          app.c['primero']['eq'] = 'Francia';
          app.c['primero']['ptos'] = app.c['fra']['ptos'];
          app.c['primero']['gf'] = app.c['fra']['gf'];
          app.c['primero']['ge'] = app.c['fra']['ge'];      
        }
        else{
          if (app.c['primero']['gf'] > app.c['fra']['gf']) {
            app.c['segundo']['eq'] = 'Francia';
            app.c['segundo']['ptos'] = app.c['fra']['ptos'];
            app.c['segundo']['gf'] = app.c['fra']['gf'];
            app.c['segundo']['ge'] = app.c['fra']['ge'];
          }
          else{
            app.c['segundo']['eq'] = app.c['primero']['eq'];
            app.c['segundo']['ptos'] = app.c['primero']['ptos'];
            app.c['segundo']['gf'] = app.c['primero']['gf'];
            app.c['segundo']['ge'] = app.c['primero']['ge'];
            app.c['primero']['eq'] = 'Francia';
            app.c['primero']['ptos'] = app.c['fra']['ptos'];
            app.c['primero']['gf'] = app.c['fra']['gf'];
            app.c['primero']['ge'] = app.c['fra']['ge']; 
          }
        }
      }
      else{
        app.c['segundo']['eq'] = 'Francia';
        app.c['segundo']['ptos'] = app.c['fra']['ptos'];
        app.c['segundo']['gf'] = app.c['fra']['gf'];
        app.c['segundo']['ge'] = app.c['fra']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.c['primero']['ptos'] < app.c['aus']['ptos']) {
        app.c['segundo']['eq'] = app.c['primero']['eq'];
        app.c['segundo']['ptos'] = app.c['primero']['ptos'];
        app.c['segundo']['gf'] = app.c['primero']['gf'];
        app.c['segundo']['ge'] = app.c['primero']['ge'];
        app.c['primero']['eq'] = 'Australia';
        app.c['primero']['ptos'] = app.c['aus']['ptos'];
        app.c['primero']['gf'] = app.c['aus']['gf'];
        app.c['primero']['ge'] = app.c['aus']['ge'];
      }
      else if (app.c['primero']['ptos'] == app.c['aus']['ptos']) {
        var difp = app.c['primero']['gf']-app.c['primero']['ge'];
        var difs = app.c['aus']['gf']-app.c['aus']['ge'];
        if (difp > difs) {
          app.c['segundo']['eq'] = 'Australia';
          app.c['segundo']['ptos'] = app.c['aus']['ptos'];
          app.c['segundo']['gf'] = app.c['aus']['gf'];
          app.c['segundo']['ge'] = app.c['aus']['ge'];
        }
        else if (difp < difs) {
          app.c['segundo']['eq'] = app.c['primero']['eq'];
          app.c['segundo']['ptos'] = app.c['primero']['ptos'];
          app.c['segundo']['gf'] = app.c['primero']['gf'];
          app.c['segundo']['ge'] = app.c['primero']['ge'];
          app.c['primero']['eq'] = 'Australia';
          app.c['primero']['ptos'] = app.c['aus']['ptos'];
          app.c['primero']['gf'] = app.c['aus']['gf'];
          app.c['primero']['ge'] = app.c['aus']['ge'];      
        }
        else{
          if (app.c['primero']['gf'] > app.c['aus']['gf']) {
            app.c['segundo']['eq'] = 'Australia';
            app.c['segundo']['ptos'] = app.c['aus']['ptos'];
            app.c['segundo']['gf'] = app.c['aus']['gf'];
            app.c['segundo']['ge'] = app.c['aus']['ge'];
          }
          else{
            app.c['segundo']['eq'] = app.c['primero']['eq'];
            app.c['segundo']['ptos'] = app.c['primero']['ptos'];
            app.c['segundo']['gf'] = app.c['primero']['gf'];
            app.c['segundo']['ge'] = app.c['primero']['ge'];
            app.c['primero']['eq'] = 'Australia';
            app.c['primero']['ptos'] = app.c['aus']['ptos'];
            app.c['primero']['gf'] = app.c['aus']['gf'];
            app.c['primero']['ge'] = app.c['aus']['ge']; 
          }
        }
      }
      else{
        if (app.c['segundo']['ptos'] < app.c['aus']['ptos']) {
          app.c['segundo']['eq'] = 'Australia';
          app.c['segundo']['ptos'] = app.c['aus']['ptos'];
          app.c['segundo']['gf'] = app.c['aus']['gf'];
          app.c['segundo']['ge'] = app.c['aus']['ge'];
        }
        else if (app.c['segundo']['ptos'] == app.c['aus']['ptos']) {
          var difp = app.c['segundo']['gf']-app.c['segundo']['ge'];
          var difs = app.c['aus']['gf']-app.c['aus']['ge'];
          if (difp < difs) {
            app.c['segundo']['eq'] = 'Australia';
            app.c['segundo']['ptos'] = app.c['aus']['ptos'];
            app.c['segundo']['gf'] = app.c['aus']['gf'];
            app.c['segundo']['ge'] = app.c['aus']['ge'];
          }
          else if (difp == difs) {
            if (app.c['segundo']['gf'] < app.c['aus']['gf']) {
              app.c['segundo']['eq'] = 'Australia';
              app.c['segundo']['ptos'] = app.c['aus']['ptos'];
              app.c['segundo']['gf'] = app.c['aus']['gf'];
              app.c['segundo']['ge'] = app.c['aus']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.c['primero']['ptos'] < app.c['din']['ptos']) {
        app.c['segundo']['eq'] = app.c['primero']['eq'];
        app.c['segundo']['ptos'] = app.c['primero']['ptos'];
        app.c['segundo']['gf'] = app.c['primero']['gf'];
        app.c['segundo']['ge'] = app.c['primero']['ge'];
        app.c['primero']['eq'] = 'Dinamarca';
        app.c['primero']['ptos'] = app.c['din']['ptos'];
        app.c['primero']['gf'] = app.c['din']['gf'];
        app.c['primero']['ge'] = app.c['din']['ge'];
      }
      else if (app.c['primero']['ptos'] == app.c['din']['ptos']) {
        var difp = app.c['primero']['gf']-app.c['primero']['ge'];
        var difs = app.c['din']['gf']-app.c['din']['ge'];
        if (difp > difs) {
          app.c['segundo']['eq'] = 'Dinamarca';
          app.c['segundo']['ptos'] = app.c['din']['ptos'];
          app.c['segundo']['gf'] = app.c['din']['gf'];
          app.c['segundo']['ge'] = app.c['din']['ge'];
        }
        else if (difp < difs) {
          app.c['segundo']['eq'] = app.c['primero']['eq'];
          app.c['segundo']['ptos'] = app.c['primero']['ptos'];
          app.c['segundo']['gf'] = app.c['primero']['gf'];
          app.c['segundo']['ge'] = app.c['primero']['ge'];
          app.c['primero']['eq'] = 'Dinamarca';
          app.c['primero']['ptos'] = app.c['din']['ptos'];
          app.c['primero']['gf'] = app.c['din']['gf'];
          app.c['primero']['ge'] = app.c['din']['ge'];      
        }
        else{
          if (app.c['primero']['gf'] > app.c['din']['gf']) {
            app.c['segundo']['eq'] = 'Dinamarca';
            app.c['segundo']['ptos'] = app.c['din']['ptos'];
            app.c['segundo']['gf'] = app.c['din']['gf'];
            app.c['segundo']['ge'] = app.c['din']['ge'];
          }
          else{
            app.c['segundo']['eq'] = app.c['primero']['eq'];
            app.c['segundo']['ptos'] = app.c['primero']['ptos'];
            app.c['segundo']['gf'] = app.c['primero']['gf'];
            app.c['segundo']['ge'] = app.c['primero']['ge'];
            app.c['primero']['eq'] = 'Dinamarca';
            app.c['primero']['ptos'] = app.c['din']['ptos'];
            app.c['primero']['gf'] = app.c['din']['gf'];
            app.c['primero']['ge'] = app.c['din']['ge']; 
          }
        }
      }
      else{
        if (app.c['segundo']['ptos'] < app.c['din']['ptos']) {
          app.c['segundo']['eq'] = 'Dinamarca';
          app.c['segundo']['ptos'] = app.c['din']['ptos'];
          app.c['segundo']['gf'] = app.c['din']['gf'];
          app.c['segundo']['ge'] = app.c['din']['ge'];
        }
        else if (app.c['segundo']['ptos'] == app.c['din']['ptos']) {
          var difp = app.c['segundo']['gf']-app.c['segundo']['ge'];
          var difs = app.c['din']['gf']-app.c['din']['ge'];
          if (difp < difs) {
            app.c['segundo']['eq'] = 'Dinamarca';
            app.c['segundo']['ptos'] = app.c['din']['ptos'];
            app.c['segundo']['gf'] = app.c['din']['gf'];
            app.c['segundo']['ge'] = app.c['din']['ge'];
          }
          else if (difp == difs) {
            if (app.c['segundo']['gf'] < app.c['din']['gf']) {
              app.c['segundo']['eq'] = 'Dinamarca';
              app.c['segundo']['ptos'] = app.c['din']['ptos'];
              app.c['segundo']['gf'] = app.c['din']['gf'];
              app.c['segundo']['ge'] = app.c['din']['ge'];
            }
          }
        }
      }

      document.getElementById('1c').value = app.c['primero']['eq'];
      document.getElementById('2c').value = app.c['segundo']['eq'];
    },

    calculateD:function(){
      app.d['arg']['ptos']=0;
      app.d['isl']['ptos']=0;
      app.d['cro']['ptos']=0;
      app.d['nig']['ptos']=0;

      app.d['arg']['gf'] = 0;
      app.d['arg']['ge'] = 0;

      app.d['isl']['gf'] = 0;
      app.d['isl']['ge'] = 0;

      app.d['cro']['gf'] = 0;
      app.d['cro']['ge'] = 0;

      app.d['nig']['gf'] = 0;
      app.d['nig']['ge'] = 0;

      var res1 = app.d['arg_isl'].split('-');
      if (res1[0] < res1[1]) {
        app.d['isl']['ptos'] += 3;
        app.d['arg']['gf'] += parseInt(res1[0]);
        app.d['arg']['ge'] += parseInt(res1[1]);
        app.d['isl']['gf'] += parseInt(res1[1]);
        app.d['isl']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.d['arg']['ptos'] += 3;
        app.d['arg']['gf'] += parseInt(res1[0]);
        app.d['arg']['ge'] += parseInt(res1[1]);
        app.d['isl']['gf'] += parseInt(res1[1]);
        app.d['isl']['ge'] += parseInt(res1[0]);
      }
      else {
        app.d['arg']['ptos'] += 1;
        app.d['isl']['ptos'] += 1;
        app.d['arg']['gf'] += parseInt(res1[0]);
        app.d['arg']['ge'] += parseInt(res1[1]);
        app.d['isl']['gf'] += parseInt(res1[1]);
        app.d['isl']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.d['cro_nig'].split('-');
      if (res2[0] < res2[1]) {
        app.d['nig']['ptos'] += 3;
        app.d['cro']['gf'] += parseInt(res2[0]);
        app.d['cro']['ge'] += parseInt(res2[1]);
        app.d['nig']['gf'] += parseInt(res2[1]);
        app.d['nig']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.d['cro']['ptos'] += 3;
        app.d['cro']['gf'] += parseInt(res2[0]);
        app.d['cro']['ge'] += parseInt(res2[1]);
        app.d['nig']['gf'] += parseInt(res2[1]);
        app.d['nig']['ge'] += parseInt(res2[0]);
      }
      else {
        app.d['cro']['ptos'] += 1;
        app.d['nig']['ptos'] += 1;
        app.d['cro']['gf'] += parseInt(res2[0]);
        app.d['cro']['ge'] += parseInt(res2[1]);
        app.d['nig']['gf'] += parseInt(res2[1]);
        app.d['nig']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.d['nig_isl'].split('-');
      if (res3[0] > res3[1]) {
        app.d['nig']['ptos'] += 3;
        app.d['nig']['gf'] += parseInt(res3[0]);
        app.d['nig']['ge'] += parseInt(res3[1]);
        app.d['isl']['gf'] += parseInt(res3[1]);
        app.d['isl']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.d['isl']['ptos'] += 3;
        app.d['isl']['gf'] += parseInt(res3[1]);
        app.d['isl']['ge'] += parseInt(res3[0]);
        app.d['nig']['gf'] += parseInt(res3[0]);
        app.d['nig']['ge'] += parseInt(res3[1]);
      }
      else {
        app.d['isl']['ptos'] += 1;
        app.d['nig']['ptos'] += 1;
        app.d['isl']['gf'] += parseInt(res3[1]);
        app.d['isl']['ge'] += parseInt(res3[0]);
        app.d['nig']['gf'] += parseInt(res3[0]);
        app.d['nig']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.d['arg_cro'].split('-');
      if (res4[0] > res4[1]) {
        app.d['arg']['ptos'] += 3;
        app.d['arg']['gf'] += parseInt(res4[0]);
        app.d['arg']['ge'] += parseInt(res4[1]);
        app.d['cro']['gf'] += parseInt(res4[1]);
        app.d['cro']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.d['cro']['ptos'] += 3;
        app.d['cro']['gf'] += parseInt(res4[1]);
        app.d['cro']['ge'] += parseInt(res4[0]);
        app.d['arg']['gf'] += parseInt(res4[0]);
        app.d['arg']['ge'] += parseInt(res4[1]);
      }
      else {
        app.d['cro']['ptos'] += 1;
        app.d['arg']['ptos'] += 1;
        app.d['cro']['gf'] += parseInt(res4[1]);
        app.d['cro']['ge'] += parseInt(res4[0]);
        app.d['arg']['gf'] += parseInt(res4[0]);
        app.d['arg']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.d['isl_cro'].split('-');
      if (res5[0] > res5[1]) {
        app.d['isl']['ptos'] += 3;
        app.d['isl']['gf'] += parseInt(res5[0]);
        app.d['isl']['ge'] += parseInt(res5[1]);
        app.d['cro']['gf'] += parseInt(res5[1]);
        app.d['cro']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.d['cro']['ptos'] += 3;
        app.d['cro']['gf'] += parseInt(res5[1]);
        app.d['cro']['ge'] += parseInt(res5[0]);
        app.d['isl']['gf'] += parseInt(res5[0]);
        app.d['isl']['ge'] += parseInt(res5[1]);
      }
      else {
        app.d['cro']['ptos'] += 1;
        app.d['isl']['ptos'] += 1;
        app.d['cro']['gf'] += parseInt(res5[1]);
        app.d['cro']['ge'] += parseInt(res5[0]);
        app.d['isl']['gf'] += parseInt(res5[0]);
        app.d['isl']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.d['nig_arg'].split('-');
      if (res6[0] > res6[1]) {
        app.d['nig']['ptos'] += 3;
        app.d['nig']['gf'] += parseInt(res6[0]);
        app.d['nig']['ge'] += parseInt(res6[1]);
        app.d['arg']['gf'] += parseInt(res6[1]);
        app.d['arg']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.d['arg']['ptos'] += 3;
        app.d['arg']['gf'] += parseInt(res6[1]);
        app.d['arg']['ge'] += parseInt(res6[0]);
        app.d['nig']['gf'] += parseInt(res6[0]);
        app.d['nig']['ge'] += parseInt(res6[1]);
      }
      else {
        app.d['arg']['ptos'] += 1;
        app.d['nig']['ptos'] += 1;
        app.d['arg']['gf'] += parseInt(res6[1]);
        app.d['arg']['ge'] += parseInt(res6[0]);
        app.d['nig']['gf'] += parseInt(res6[0]);
        app.d['nig']['ge'] += parseInt(res6[1]);
      }

      if (app.d['primero']['ptos'] < app.d['cro']['ptos']) {
        app.d['primero']['eq'] = 'Croacia';
        app.d['primero']['ptos'] = app.d['cro']['ptos'];
        app.d['primero']['gf'] = app.d['cro']['gf'];
        app.d['primero']['ge'] = app.d['cro']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.d['primero']['ptos'] < app.d['arg']['ptos']) {
        app.d['segundo']['eq'] = app.d['primero']['eq'];
        app.d['segundo']['ptos'] = app.d['primero']['ptos'];
        app.d['segundo']['gf'] = app.d['primero']['gf'];
        app.d['segundo']['ge'] = app.d['primero']['ge'];
        app.d['primero']['eq'] = 'Argentina';
        app.d['primero']['ptos'] = app.d['arg']['ptos'];
        app.d['primero']['gf'] = app.d['arg']['gf'];
        app.d['primero']['ge'] = app.d['arg']['ge'];
      }
      else if (app.d['primero']['ptos'] == app.d['arg']['ptos']) {
        var difp = app.d['primero']['gf']-app.d['primero']['ge'];
        var difs = app.d['arg']['gf']-app.d['arg']['ge'];
        if (difp > difs) {
          app.d['segundo']['eq'] = 'Argentina';
          app.d['segundo']['ptos'] = app.d['arg']['ptos'];
          app.d['segundo']['gf'] = app.d['arg']['gf'];
          app.d['segundo']['ge'] = app.d['arg']['ge'];
        }
        else if (difp < difs) {
          app.d['segundo']['eq'] = app.d['primero']['eq'];
          app.d['segundo']['ptos'] = app.d['primero']['ptos'];
          app.d['segundo']['gf'] = app.d['primero']['gf'];
          app.d['segundo']['ge'] = app.d['primero']['ge'];
          app.d['primero']['eq'] = 'Argentina';
          app.d['primero']['ptos'] = app.d['arg']['ptos'];
          app.d['primero']['gf'] = app.d['arg']['gf'];
          app.d['primero']['ge'] = app.d['arg']['ge'];      
        }
        else{
          if (app.d['primero']['gf'] > app.d['arg']['gf']) {
            app.d['segundo']['eq'] = 'Argentina';
            app.d['segundo']['ptos'] = app.d['arg']['ptos'];
            app.d['segundo']['gf'] = app.d['arg']['gf'];
            app.d['segundo']['ge'] = app.d['arg']['ge'];
          }
          else{
            app.d['segundo']['eq'] = app.d['primero']['eq'];
            app.d['segundo']['ptos'] = app.d['primero']['ptos'];
            app.d['segundo']['gf'] = app.d['primero']['gf'];
            app.d['segundo']['ge'] = app.d['primero']['ge'];
            app.d['primero']['eq'] = 'Argentina';
            app.d['primero']['ptos'] = app.d['arg']['ptos'];
            app.d['primero']['gf'] = app.d['arg']['gf'];
            app.d['primero']['ge'] = app.d['arg']['ge']; 
          }
        }
      }
      else{
        app.d['segundo']['eq'] = 'Argentina';
        app.d['segundo']['ptos'] = app.d['arg']['ptos'];
        app.d['segundo']['gf'] = app.d['arg']['gf'];
        app.d['segundo']['ge'] = app.d['arg']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.d['primero']['ptos'] < app.d['isl']['ptos']) {
        app.d['segundo']['eq'] = app.d['primero']['eq'];
        app.d['segundo']['ptos'] = app.d['primero']['ptos'];
        app.d['segundo']['gf'] = app.d['primero']['gf'];
        app.d['segundo']['ge'] = app.d['primero']['ge'];
        app.d['primero']['eq'] = 'Islandia';
        app.d['primero']['ptos'] = app.d['isl']['ptos'];
        app.d['primero']['gf'] = app.d['isl']['gf'];
        app.d['primero']['ge'] = app.d['isl']['ge'];
      }
      else if (app.d['primero']['ptos'] == app.d['isl']['ptos']) {
        var difp = app.d['primero']['gf']-app.d['primero']['ge'];
        var difs = app.d['isl']['gf']-app.d['isl']['ge'];
        if (difp > difs) {
          app.d['segundo']['eq'] = 'Islandia';
          app.d['segundo']['ptos'] = app.d['isl']['ptos'];
          app.d['segundo']['gf'] = app.d['isl']['gf'];
          app.d['segundo']['ge'] = app.d['isl']['ge'];
        }
        else if (difp < difs) {
          app.d['segundo']['eq'] = app.d['primero']['eq'];
          app.d['segundo']['ptos'] = app.d['primero']['ptos'];
          app.d['segundo']['gf'] = app.d['primero']['gf'];
          app.d['segundo']['ge'] = app.d['primero']['ge'];
          app.d['primero']['eq'] = 'Islandia';
          app.d['primero']['ptos'] = app.d['isl']['ptos'];
          app.d['primero']['gf'] = app.d['isl']['gf'];
          app.d['primero']['ge'] = app.d['isl']['ge'];      
        }
        else{
          if (app.d['primero']['gf'] > app.d['isl']['gf']) {
            app.d['segundo']['eq'] = 'Islandia';
            app.d['segundo']['ptos'] = app.d['isl']['ptos'];
            app.d['segundo']['gf'] = app.d['isl']['gf'];
            app.d['segundo']['ge'] = app.d['isl']['ge'];
          }
          else{
            app.d['segundo']['eq'] = app.d['primero']['eq'];
            app.d['segundo']['ptos'] = app.d['primero']['ptos'];
            app.d['segundo']['gf'] = app.d['primero']['gf'];
            app.d['segundo']['ge'] = app.d['primero']['ge'];
            app.d['primero']['eq'] = 'Islandia';
            app.d['primero']['ptos'] = app.d['isl']['ptos'];
            app.d['primero']['gf'] = app.d['isl']['gf'];
            app.d['primero']['ge'] = app.d['isl']['ge']; 
          }
        }
      }
      else{
        if (app.d['segundo']['ptos'] < app.d['isl']['ptos']) {
          app.d['segundo']['eq'] = 'Islandia';
          app.d['segundo']['ptos'] = app.d['isl']['ptos'];
          app.d['segundo']['gf'] = app.d['isl']['gf'];
          app.d['segundo']['ge'] = app.d['isl']['ge'];
        }
        else if (app.d['segundo']['ptos'] == app.d['isl']['ptos']) {
          var difp = app.d['segundo']['gf']-app.d['segundo']['ge'];
          var difs = app.d['isl']['gf']-app.d['isl']['ge'];
          if (difp < difs) {
            app.d['segundo']['eq'] = 'Islandia';
            app.d['segundo']['ptos'] = app.d['isl']['ptos'];
            app.d['segundo']['gf'] = app.d['isl']['gf'];
            app.d['segundo']['ge'] = app.d['isl']['ge'];
          }
          else if (difp == difs) {
            if (app.d['segundo']['gf'] < app.d['isl']['gf']) {
              app.d['segundo']['eq'] = 'Islandia';
              app.d['segundo']['ptos'] = app.d['isl']['ptos'];
              app.d['segundo']['gf'] = app.d['isl']['gf'];
              app.d['segundo']['ge'] = app.d['isl']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.d['primero']['ptos'] < app.d['nig']['ptos']) {
        app.d['segundo']['eq'] = app.d['primero']['eq'];
        app.d['segundo']['ptos'] = app.d['primero']['ptos'];
        app.d['segundo']['gf'] = app.d['primero']['gf'];
        app.d['segundo']['ge'] = app.d['primero']['ge'];
        app.d['primero']['eq'] = 'Nigeria';
        app.d['primero']['ptos'] = app.d['nig']['ptos'];
        app.d['primero']['gf'] = app.d['nig']['gf'];
        app.d['primero']['ge'] = app.d['nig']['ge'];
      }
      else if (app.d['primero']['ptos'] == app.d['nig']['ptos']) {
        var difp = app.d['primero']['gf']-app.d['primero']['ge'];
        var difs = app.d['nig']['gf']-app.d['nig']['ge'];
        if (difp > difs) {
          app.d['segundo']['eq'] = 'Nigeria';
          app.d['segundo']['ptos'] = app.d['nig']['ptos'];
          app.d['segundo']['gf'] = app.d['nig']['gf'];
          app.d['segundo']['ge'] = app.d['nig']['ge'];
        }
        else if (difp < difs) {
          app.d['segundo']['eq'] = app.d['primero']['eq'];
          app.d['segundo']['ptos'] = app.d['primero']['ptos'];
          app.d['segundo']['gf'] = app.d['primero']['gf'];
          app.d['segundo']['ge'] = app.d['primero']['ge'];
          app.d['primero']['eq'] = 'Nigeria';
          app.d['primero']['ptos'] = app.d['nig']['ptos'];
          app.d['primero']['gf'] = app.d['nig']['gf'];
          app.d['primero']['ge'] = app.d['nig']['ge'];      
        }
        else{
          if (app.d['primero']['gf'] > app.d['nig']['gf']) {
            app.d['segundo']['eq'] = 'Nigeria';
            app.d['segundo']['ptos'] = app.d['nig']['ptos'];
            app.d['segundo']['gf'] = app.d['nig']['gf'];
            app.d['segundo']['ge'] = app.d['nig']['ge'];
          }
          else{
            app.d['segundo']['eq'] = app.d['primero']['eq'];
            app.d['segundo']['ptos'] = app.d['primero']['ptos'];
            app.d['segundo']['gf'] = app.d['primero']['gf'];
            app.d['segundo']['ge'] = app.d['primero']['ge'];
            app.d['primero']['eq'] = 'Nigeria';
            app.d['primero']['ptos'] = app.d['nig']['ptos'];
            app.d['primero']['gf'] = app.d['nig']['gf'];
            app.d['primero']['ge'] = app.d['nig']['ge']; 
          }
        }
      }
      else{
        if (app.d['segundo']['ptos'] < app.d['nig']['ptos']) {
          app.d['segundo']['eq'] = 'Nigeria';
          app.d['segundo']['ptos'] = app.d['nig']['ptos'];
          app.d['segundo']['gf'] = app.d['nig']['gf'];
          app.d['segundo']['ge'] = app.d['nig']['ge'];
        }
        else if (app.d['segundo']['ptos'] == app.d['nig']['ptos']) {
          var difp = app.d['segundo']['gf']-app.d['segundo']['ge'];
          var difs = app.d['nig']['gf']-app.d['nig']['ge'];
          if (difp < difs) {
            app.d['segundo']['eq'] = 'Nigeria';
            app.d['segundo']['ptos'] = app.d['nig']['ptos'];
            app.d['segundo']['gf'] = app.d['nig']['gf'];
            app.d['segundo']['ge'] = app.d['nig']['ge'];
          }
          else if (difp == difs) {
            if (app.d['segundo']['gf'] < app.d['nig']['gf']) {
              app.d['segundo']['eq'] = 'Nigeria';
              app.d['segundo']['ptos'] = app.d['nig']['ptos'];
              app.d['segundo']['gf'] = app.d['nig']['gf'];
              app.d['segundo']['ge'] = app.d['nig']['ge'];
            }
          }
        }
      }

      document.getElementById('1d').value = app.d['primero']['eq'];
      document.getElementById('2d').value = app.d['segundo']['eq'];
    },

    calculateE:function(){
      app.e['cos']['ptos']=0;
      app.e['ser']['ptos']=0;
      app.e['bra']['ptos']=0;
      app.e['sui']['ptos']=0;

      app.e['cos']['gf'] = 0;
      app.e['cos']['ge'] = 0;

      app.e['ser']['gf'] = 0;
      app.e['ser']['ge'] = 0;

      app.e['bra']['gf'] = 0;
      app.e['bra']['ge'] = 0;

      app.e['sui']['gf'] = 0;
      app.e['sui']['ge'] = 0;

      var res1 = app.e['cos_ser'].split('-');
      if (res1[0] < res1[1]) {
        app.e['ser']['ptos'] += 3;
        app.e['cos']['gf'] += parseInt(res1[0]);
        app.e['cos']['ge'] += parseInt(res1[1]);
        app.e['ser']['gf'] += parseInt(res1[1]);
        app.e['ser']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.e['cos']['ptos'] += 3;
        app.e['cos']['gf'] += parseInt(res1[0]);
        app.e['cos']['ge'] += parseInt(res1[1]);
        app.e['ser']['gf'] += parseInt(res1[1]);
        app.e['ser']['ge'] += parseInt(res1[0]);
      }
      else {
        app.e['cos']['ptos'] += 1;
        app.e['ser']['ptos'] += 1;
        app.e['cos']['gf'] += parseInt(res1[0]);
        app.e['cos']['ge'] += parseInt(res1[1]);
        app.e['ser']['gf'] += parseInt(res1[1]);
        app.e['ser']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.e['bra_sui'].split('-');
      if (res2[0] < res2[1]) {
        app.e['sui']['ptos'] += 3;
        app.e['bra']['gf'] += parseInt(res2[0]);
        app.e['bra']['ge'] += parseInt(res2[1]);
        app.e['sui']['gf'] += parseInt(res2[1]);
        app.e['sui']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.e['bra']['ptos'] += 3;
        app.e['bra']['gf'] += parseInt(res2[0]);
        app.e['bra']['ge'] += parseInt(res2[1]);
        app.e['sui']['gf'] += parseInt(res2[1]);
        app.e['sui']['ge'] += parseInt(res2[0]);
      }
      else {
        app.e['bra']['ptos'] += 1;
        app.e['sui']['ptos'] += 1;
        app.e['bra']['gf'] += parseInt(res2[0]);
        app.e['bra']['ge'] += parseInt(res2[1]);
        app.e['sui']['gf'] += parseInt(res2[1]);
        app.e['sui']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.e['ser_sui'].split('-');
      if (res3[0] > res3[1]) {
        app.e['ser']['ptos'] += 3;
        app.e['ser']['gf'] += parseInt(res3[0]);
        app.e['ser']['ge'] += parseInt(res3[1]);
        app.e['sui']['gf'] += parseInt(res3[1]);
        app.e['sui']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.e['sui']['ptos'] += 3;
        app.e['sui']['gf'] += parseInt(res3[1]);
        app.e['sui']['ge'] += parseInt(res3[0]);
        app.e['ser']['gf'] += parseInt(res3[0]);
        app.e['ser']['ge'] += parseInt(res3[1]);
      }
      else {
        app.e['sui']['ptos'] += 1;
        app.e['ser']['ptos'] += 1;
        app.e['sui']['gf'] += parseInt(res3[1]);
        app.e['sui']['ge'] += parseInt(res3[0]);
        app.e['ser']['gf'] += parseInt(res3[0]);
        app.e['ser']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.e['bra_cos'].split('-');
      if (res4[0] > res4[1]) {
        app.e['bra']['ptos'] += 3;
        app.e['bra']['gf'] += parseInt(res4[0]);
        app.e['bra']['ge'] += parseInt(res4[1]);
        app.e['cos']['gf'] += parseInt(res4[1]);
        app.e['cos']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.e['cos']['ptos'] += 3;
        app.e['cos']['gf'] += parseInt(res4[1]);
        app.e['cos']['ge'] += parseInt(res4[0]);
        app.e['bra']['gf'] += parseInt(res4[0]);
        app.e['bra']['ge'] += parseInt(res4[1]);
      }
      else {
        app.e['cos']['ptos'] += 1;
        app.e['bra']['ptos'] += 1;
        app.e['cos']['gf'] += parseInt(res4[1]);
        app.e['cos']['ge'] += parseInt(res4[0]);
        app.e['bra']['gf'] += parseInt(res4[0]);
        app.e['bra']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.e['ser_bra'].split('-');
      if (res5[0] > res5[1]) {
        app.e['ser']['ptos'] += 3;
        app.e['ser']['gf'] += parseInt(res5[0]);
        app.e['ser']['ge'] += parseInt(res5[1]);
        app.e['bra']['gf'] += parseInt(res5[1]);
        app.e['bra']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.e['bra']['ptos'] += 3;
        app.e['bra']['gf'] += parseInt(res5[1]);
        app.e['bra']['ge'] += parseInt(res5[0]);
        app.e['ser']['gf'] += parseInt(res5[0]);
        app.e['ser']['ge'] += parseInt(res5[1]);
      }
      else {
        app.e['bra']['ptos'] += 1;
        app.e['ser']['ptos'] += 1;
        app.e['bra']['gf'] += parseInt(res5[1]);
        app.e['bra']['ge'] += parseInt(res5[0]);
        app.e['ser']['gf'] += parseInt(res5[0]);
        app.e['ser']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.e['sui_cos'].split('-');
      if (res6[0] > res6[1]) {
        app.e['sui']['ptos'] += 3;
        app.e['sui']['gf'] += parseInt(res6[0]);
        app.e['sui']['ge'] += parseInt(res6[1]);
        app.e['cos']['gf'] += parseInt(res6[1]);
        app.e['cos']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.e['cos']['ptos'] += 3;
        app.e['cos']['gf'] += parseInt(res6[1]);
        app.e['cos']['ge'] += parseInt(res6[0]);
        app.e['sui']['gf'] += parseInt(res6[0]);
        app.e['sui']['ge'] += parseInt(res6[1]);
      }
      else {
        app.e['cos']['ptos'] += 1;
        app.e['sui']['ptos'] += 1;
        app.e['cos']['gf'] += parseInt(res6[1]);
        app.e['cos']['ge'] += parseInt(res6[0]);
        app.e['sui']['gf'] += parseInt(res6[0]);
        app.e['sui']['ge'] += parseInt(res6[1]);
      }

      if (app.e['primero']['ptos'] < app.e['bra']['ptos']) {
        app.e['primero']['eq'] = 'Brasil';
        app.e['primero']['ptos'] = app.e['bra']['ptos'];
        app.e['primero']['gf'] = app.e['bra']['gf'];
        app.e['primero']['ge'] = app.e['bra']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.e['primero']['ptos'] < app.e['cos']['ptos']) {
        app.e['segundo']['eq'] = app.e['primero']['eq'];
        app.e['segundo']['ptos'] = app.e['primero']['ptos'];
        app.e['segundo']['gf'] = app.e['primero']['gf'];
        app.e['segundo']['ge'] = app.e['primero']['ge'];
        app.e['primero']['eq'] = 'Costa Rica';
        app.e['primero']['ptos'] = app.e['cos']['ptos'];
        app.e['primero']['gf'] = app.e['cos']['gf'];
        app.e['primero']['ge'] = app.e['cos']['ge'];
      }
      else if (app.e['primero']['ptos'] == app.e['cos']['ptos']) {
        var difp = app.e['primero']['gf']-app.e['primero']['ge'];
        var difs = app.e['cos']['gf']-app.e['cos']['ge'];
        if (difp > difs) {
          app.e['segundo']['eq'] = 'Costa Rica';
          app.e['segundo']['ptos'] = app.e['cos']['ptos'];
          app.e['segundo']['gf'] = app.e['cos']['gf'];
          app.e['segundo']['ge'] = app.e['cos']['ge'];
        }
        else if (difp < difs) {
          app.e['segundo']['eq'] = app.e['primero']['eq'];
          app.e['segundo']['ptos'] = app.e['primero']['ptos'];
          app.e['segundo']['gf'] = app.e['primero']['gf'];
          app.e['segundo']['ge'] = app.e['primero']['ge'];
          app.e['primero']['eq'] = 'Costa Rica';
          app.e['primero']['ptos'] = app.e['cos']['ptos'];
          app.e['primero']['gf'] = app.e['cos']['gf'];
          app.e['primero']['ge'] = app.e['cos']['ge'];      
        }
        else{
          if (app.e['primero']['gf'] > app.e['cos']['gf']) {
            app.e['segundo']['eq'] = 'Costa Rica';
            app.e['segundo']['ptos'] = app.e['cos']['ptos'];
            app.e['segundo']['gf'] = app.e['cos']['gf'];
            app.e['segundo']['ge'] = app.e['cos']['ge'];
          }
          else{
            app.e['segundo']['eq'] = app.e['primero']['eq'];
            app.e['segundo']['ptos'] = app.e['primero']['ptos'];
            app.e['segundo']['gf'] = app.e['primero']['gf'];
            app.e['segundo']['ge'] = app.e['primero']['ge'];
            app.e['primero']['eq'] = 'Costa Rica';
            app.e['primero']['ptos'] = app.e['cos']['ptos'];
            app.e['primero']['gf'] = app.e['cos']['gf'];
            app.e['primero']['ge'] = app.e['cos']['ge']; 
          }
        }
      }
      else{
        app.e['segundo']['eq'] = 'Costa Rica';
        app.e['segundo']['ptos'] = app.e['cos']['ptos'];
        app.e['segundo']['gf'] = app.e['cos']['gf'];
        app.e['segundo']['ge'] = app.e['cos']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.e['primero']['ptos'] < app.e['ser']['ptos']) {
        app.e['segundo']['eq'] = app.e['primero']['eq'];
        app.e['segundo']['ptos'] = app.e['primero']['ptos'];
        app.e['segundo']['gf'] = app.e['primero']['gf'];
        app.e['segundo']['ge'] = app.e['primero']['ge'];
        app.e['primero']['eq'] = 'Serbia';
        app.e['primero']['ptos'] = app.e['ser']['ptos'];
        app.e['primero']['gf'] = app.e['ser']['gf'];
        app.e['primero']['ge'] = app.e['ser']['ge'];
      }
      else if (app.e['primero']['ptos'] == app.e['ser']['ptos']) {
        var difp = app.e['primero']['gf']-app.e['primero']['ge'];
        var difs = app.e['ser']['gf']-app.e['ser']['ge'];
        if (difp > difs) {
          app.e['segundo']['eq'] = 'Serbia';
          app.e['segundo']['ptos'] = app.e['ser']['ptos'];
          app.e['segundo']['gf'] = app.e['ser']['gf'];
          app.e['segundo']['ge'] = app.e['ser']['ge'];
        }
        else if (difp < difs) {
          app.e['segundo']['eq'] = app.e['primero']['eq'];
          app.e['segundo']['ptos'] = app.e['primero']['ptos'];
          app.e['segundo']['gf'] = app.e['primero']['gf'];
          app.e['segundo']['ge'] = app.e['primero']['ge'];
          app.e['primero']['eq'] = 'Serbia';
          app.e['primero']['ptos'] = app.e['ser']['ptos'];
          app.e['primero']['gf'] = app.e['ser']['gf'];
          app.e['primero']['ge'] = app.e['ser']['ge'];      
        }
        else{
          if (app.e['primero']['gf'] > app.e['ser']['gf']) {
            app.e['segundo']['eq'] = 'Serbia';
            app.e['segundo']['ptos'] = app.e['ser']['ptos'];
            app.e['segundo']['gf'] = app.e['ser']['gf'];
            app.e['segundo']['ge'] = app.e['ser']['ge'];
          }
          else{
            app.e['segundo']['eq'] = app.e['primero']['eq'];
            app.e['segundo']['ptos'] = app.e['primero']['ptos'];
            app.e['segundo']['gf'] = app.e['primero']['gf'];
            app.e['segundo']['ge'] = app.e['primero']['ge'];
            app.e['primero']['eq'] = 'Serbia';
            app.e['primero']['ptos'] = app.e['ser']['ptos'];
            app.e['primero']['gf'] = app.e['ser']['gf'];
            app.e['primero']['ge'] = app.e['ser']['ge']; 
          }
        }
      }
      else{
        if (app.e['segundo']['ptos'] < app.e['ser']['ptos']) {
          app.e['segundo']['eq'] = 'Serbia';
          app.e['segundo']['ptos'] = app.e['ser']['ptos'];
          app.e['segundo']['gf'] = app.e['ser']['gf'];
          app.e['segundo']['ge'] = app.e['ser']['ge'];
        }
        else if (app.e['segundo']['ptos'] == app.e['ser']['ptos']) {
          var difp = app.e['segundo']['gf']-app.e['segundo']['ge'];
          var difs = app.e['ser']['gf']-app.e['ser']['ge'];
          if (difp < difs) {
            app.e['segundo']['eq'] = 'Serbia';
            app.e['segundo']['ptos'] = app.e['ser']['ptos'];
            app.e['segundo']['gf'] = app.e['ser']['gf'];
            app.e['segundo']['ge'] = app.e['ser']['ge'];
          }
          else if (difp == difs) {
            if (app.e['segundo']['gf'] < app.e['ser']['gf']) {
              app.e['segundo']['eq'] = 'Serbia';
              app.e['segundo']['ptos'] = app.e['ser']['ptos'];
              app.e['segundo']['gf'] = app.e['ser']['gf'];
              app.e['segundo']['ge'] = app.e['ser']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.e['primero']['ptos'] < app.e['sui']['ptos']) {
        app.e['segundo']['eq'] = app.e['primero']['eq'];
        app.e['segundo']['ptos'] = app.e['primero']['ptos'];
        app.e['segundo']['gf'] = app.e['primero']['gf'];
        app.e['segundo']['ge'] = app.e['primero']['ge'];
        app.e['primero']['eq'] = 'Suiza';
        app.e['primero']['ptos'] = app.e['sui']['ptos'];
        app.e['primero']['gf'] = app.e['sui']['gf'];
        app.e['primero']['ge'] = app.e['sui']['ge'];
      }
      else if (app.e['primero']['ptos'] == app.e['sui']['ptos']) {
        var difp = app.e['primero']['gf']-app.e['primero']['ge'];
        var difs = app.e['sui']['gf']-app.e['sui']['ge'];
        if (difp > difs) {
          app.e['segundo']['eq'] = 'Suiza';
          app.e['segundo']['ptos'] = app.e['sui']['ptos'];
          app.e['segundo']['gf'] = app.e['sui']['gf'];
          app.e['segundo']['ge'] = app.e['sui']['ge'];
        }
        else if (difp < difs) {
          app.e['segundo']['eq'] = app.e['primero']['eq'];
          app.e['segundo']['ptos'] = app.e['primero']['ptos'];
          app.e['segundo']['gf'] = app.e['primero']['gf'];
          app.e['segundo']['ge'] = app.e['primero']['ge'];
          app.e['primero']['eq'] = 'Suiza';
          app.e['primero']['ptos'] = app.e['sui']['ptos'];
          app.e['primero']['gf'] = app.e['sui']['gf'];
          app.e['primero']['ge'] = app.e['sui']['ge'];      
        }
        else{
          if (app.e['primero']['gf'] > app.e['sui']['gf']) {
            app.e['segundo']['eq'] = 'Suiza';
            app.e['segundo']['ptos'] = app.e['sui']['ptos'];
            app.e['segundo']['gf'] = app.e['sui']['gf'];
            app.e['segundo']['ge'] = app.e['sui']['ge'];
          }
          else{
            app.e['segundo']['eq'] = app.e['primero']['eq'];
            app.e['segundo']['ptos'] = app.e['primero']['ptos'];
            app.e['segundo']['gf'] = app.e['primero']['gf'];
            app.e['segundo']['ge'] = app.e['primero']['ge'];
            app.e['primero']['eq'] = 'Suiza';
            app.e['primero']['ptos'] = app.e['sui']['ptos'];
            app.e['primero']['gf'] = app.e['sui']['gf'];
            app.e['primero']['ge'] = app.e['sui']['ge']; 
          }
        }
      }
      else{
        if (app.e['segundo']['ptos'] < app.e['sui']['ptos']) {
          app.e['segundo']['eq'] = 'Suiza';
          app.e['segundo']['ptos'] = app.e['sui']['ptos'];
          app.e['segundo']['gf'] = app.e['sui']['gf'];
          app.e['segundo']['ge'] = app.e['sui']['ge'];
        }
        else if (app.e['segundo']['ptos'] == app.e['sui']['ptos']) {
          var difp = app.e['segundo']['gf']-app.e['segundo']['ge'];
          var difs = app.e['sui']['gf']-app.e['sui']['ge'];
          if (difp < difs) {
            app.e['segundo']['eq'] = 'Suiza';
            app.e['segundo']['ptos'] = app.e['sui']['ptos'];
            app.e['segundo']['gf'] = app.e['sui']['gf'];
            app.e['segundo']['ge'] = app.e['sui']['ge'];
          }
          else if (difp == difs) {
            if (app.e['segundo']['gf'] < app.e['sui']['gf']) {
              app.e['segundo']['eq'] = 'Suiza';
              app.e['segundo']['ptos'] = app.e['sui']['ptos'];
              app.e['segundo']['gf'] = app.e['sui']['gf'];
              app.e['segundo']['ge'] = app.e['sui']['ge'];
            }
          }
        }
      }

      document.getElementById('1e').value = app.e['primero']['eq'];
      document.getElementById('2e').value = app.e['segundo']['eq'];
    },

    calculateF:function(){
      app.f['ale']['ptos']=0;
      app.f['mex']['ptos']=0;
      app.f['sue']['ptos']=0;
      app.f['cor']['ptos']=0;

      app.f['ale']['gf'] = 0;
      app.f['ale']['ge'] = 0;

      app.f['mex']['gf'] = 0;
      app.f['mex']['ge'] = 0;

      app.f['sue']['gf'] = 0;
      app.f['sue']['ge'] = 0;

      app.f['cor']['gf'] = 0;
      app.f['cor']['ge'] = 0;

      var res1 = app.f['ale_mex'].split('-');
      if (res1[0] < res1[1]) {
        app.f['mex']['ptos'] += 3;
        app.f['ale']['gf'] += parseInt(res1[0]);
        app.f['ale']['ge'] += parseInt(res1[1]);
        app.f['mex']['gf'] += parseInt(res1[1]);
        app.f['mex']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.f['ale']['ptos'] += 3;
        app.f['ale']['gf'] += parseInt(res1[0]);
        app.f['ale']['ge'] += parseInt(res1[1]);
        app.f['mex']['gf'] += parseInt(res1[1]);
        app.f['mex']['ge'] += parseInt(res1[0]);
      }
      else {
        app.f['ale']['ptos'] += 1;
        app.f['mex']['ptos'] += 1;
        app.f['ale']['gf'] += parseInt(res1[0]);
        app.f['ale']['ge'] += parseInt(res1[1]);
        app.f['mex']['gf'] += parseInt(res1[1]);
        app.f['mex']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.f['sue_cor'].split('-');
      if (res2[0] < res2[1]) {
        app.f['cor']['ptos'] += 3;
        app.f['sue']['gf'] += parseInt(res2[0]);
        app.f['sue']['ge'] += parseInt(res2[1]);
        app.f['cor']['gf'] += parseInt(res2[1]);
        app.f['cor']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.f['sue']['ptos'] += 3;
        app.f['sue']['gf'] += parseInt(res2[0]);
        app.f['sue']['ge'] += parseInt(res2[1]);
        app.f['cor']['gf'] += parseInt(res2[1]);
        app.f['cor']['ge'] += parseInt(res2[0]);
      }
      else {
        app.f['sue']['ptos'] += 1;
        app.f['cor']['ptos'] += 1;
        app.f['sue']['gf'] += parseInt(res2[0]);
        app.f['sue']['ge'] += parseInt(res2[1]);
        app.f['cor']['gf'] += parseInt(res2[1]);
        app.f['cor']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.f['cor_mex'].split('-');
      if (res3[0] > res3[1]) {
        app.f['cor']['ptos'] += 3;
        app.f['cor']['gf'] += parseInt(res3[0]);
        app.f['cor']['ge'] += parseInt(res3[1]);
        app.f['mex']['gf'] += parseInt(res3[1]);
        app.f['mex']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.f['mex']['ptos'] += 3;
        app.f['mex']['gf'] += parseInt(res3[1]);
        app.f['mex']['ge'] += parseInt(res3[0]);
        app.f['cor']['gf'] += parseInt(res3[0]);
        app.f['cor']['ge'] += parseInt(res3[1]);
      }
      else {
        app.f['mex']['ptos'] += 1;
        app.f['cor']['ptos'] += 1;
        app.f['mex']['gf'] += parseInt(res3[1]);
        app.f['mex']['ge'] += parseInt(res3[0]);
        app.f['cor']['gf'] += parseInt(res3[0]);
        app.f['cor']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.f['ale_sue'].split('-');
      if (res4[0] > res4[1]) {
        app.f['ale']['ptos'] += 3;
        app.f['ale']['gf'] += parseInt(res4[0]);
        app.f['ale']['ge'] += parseInt(res4[1]);
        app.f['sue']['gf'] += parseInt(res4[1]);
        app.f['sue']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.f['sue']['ptos'] += 3;
        app.f['sue']['gf'] += parseInt(res4[1]);
        app.f['sue']['ge'] += parseInt(res4[0]);
        app.f['ale']['gf'] += parseInt(res4[0]);
        app.f['ale']['ge'] += parseInt(res4[1]);
      }
      else {
        app.f['sue']['ptos'] += 1;
        app.f['ale']['ptos'] += 1;
        app.f['sue']['gf'] += parseInt(res4[1]);
        app.f['sue']['ge'] += parseInt(res4[0]);
        app.f['ale']['gf'] += parseInt(res4[0]);
        app.f['ale']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.f['mex_sue'].split('-');
      if (res5[0] > res5[1]) {
        app.f['mex']['ptos'] += 3;
        app.f['mex']['gf'] += parseInt(res5[0]);
        app.f['mex']['ge'] += parseInt(res5[1]);
        app.f['sue']['gf'] += parseInt(res5[1]);
        app.f['sue']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.f['sue']['ptos'] += 3;
        app.f['sue']['gf'] += parseInt(res5[1]);
        app.f['sue']['ge'] += parseInt(res5[0]);
        app.f['mex']['gf'] += parseInt(res5[0]);
        app.f['mex']['ge'] += parseInt(res5[1]);
      }
      else {
        app.f['sue']['ptos'] += 1;
        app.f['mex']['ptos'] += 1;
        app.f['sue']['gf'] += parseInt(res5[1]);
        app.f['sue']['ge'] += parseInt(res5[0]);
        app.f['mex']['gf'] += parseInt(res5[0]);
        app.f['mex']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.f['cor_ale'].split('-');
      if (res6[0] > res6[1]) {
        app.f['cor']['ptos'] += 3;
        app.f['cor']['gf'] += parseInt(res6[0]);
        app.f['cor']['ge'] += parseInt(res6[1]);
        app.f['ale']['gf'] += parseInt(res6[1]);
        app.f['ale']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.f['ale']['ptos'] += 3;
        app.f['ale']['gf'] += parseInt(res6[1]);
        app.f['ale']['ge'] += parseInt(res6[0]);
        app.f['cor']['gf'] += parseInt(res6[0]);
        app.f['cor']['ge'] += parseInt(res6[1]);
      }
      else {
        app.f['ale']['ptos'] += 1;
        app.f['cor']['ptos'] += 1;
        app.f['ale']['gf'] += parseInt(res6[1]);
        app.f['ale']['ge'] += parseInt(res6[0]);
        app.f['cor']['gf'] += parseInt(res6[0]);
        app.f['cor']['ge'] += parseInt(res6[1]);
      }

      if (app.f['primero']['ptos'] < app.f['sue']['ptos']) {
        app.f['primero']['eq'] = 'Suecia';
        app.f['primero']['ptos'] = app.f['sue']['ptos'];
        app.f['primero']['gf'] = app.f['sue']['gf'];
        app.f['primero']['ge'] = app.f['sue']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.f['primero']['ptos'] < app.f['ale']['ptos']) {
        app.f['segundo']['eq'] = app.f['primero']['eq'];
        app.f['segundo']['ptos'] = app.f['primero']['ptos'];
        app.f['segundo']['gf'] = app.f['primero']['gf'];
        app.f['segundo']['ge'] = app.f['primero']['ge'];
        app.f['primero']['eq'] = 'Alemania';
        app.f['primero']['ptos'] = app.f['ale']['ptos'];
        app.f['primero']['gf'] = app.f['ale']['gf'];
        app.f['primero']['ge'] = app.f['ale']['ge'];
      }
      else if (app.f['primero']['ptos'] == app.f['ale']['ptos']) {
        var difp = app.f['primero']['gf']-app.f['primero']['ge'];
        var difs = app.f['ale']['gf']-app.f['ale']['ge'];
        if (difp > difs) {
          app.f['segundo']['eq'] = 'Alemania';
          app.f['segundo']['ptos'] = app.f['ale']['ptos'];
          app.f['segundo']['gf'] = app.f['ale']['gf'];
          app.f['segundo']['ge'] = app.f['ale']['ge'];
        }
        else if (difp < difs) {
          app.f['segundo']['eq'] = app.f['primero']['eq'];
          app.f['segundo']['ptos'] = app.f['primero']['ptos'];
          app.f['segundo']['gf'] = app.f['primero']['gf'];
          app.f['segundo']['ge'] = app.f['primero']['ge'];
          app.f['primero']['eq'] = 'Alemania';
          app.f['primero']['ptos'] = app.f['ale']['ptos'];
          app.f['primero']['gf'] = app.f['ale']['gf'];
          app.f['primero']['ge'] = app.f['ale']['ge'];      
        }
        else{
          if (app.f['primero']['gf'] > app.f['ale']['gf']) {
            app.f['segundo']['eq'] = 'Alemania';
            app.f['segundo']['ptos'] = app.f['ale']['ptos'];
            app.f['segundo']['gf'] = app.f['ale']['gf'];
            app.f['segundo']['ge'] = app.f['ale']['ge'];
          }
          else{
            app.f['segundo']['eq'] = app.f['primero']['eq'];
            app.f['segundo']['ptos'] = app.f['primero']['ptos'];
            app.f['segundo']['gf'] = app.f['primero']['gf'];
            app.f['segundo']['ge'] = app.f['primero']['ge'];
            app.f['primero']['eq'] = 'Alemania';
            app.f['primero']['ptos'] = app.f['ale']['ptos'];
            app.f['primero']['gf'] = app.f['ale']['gf'];
            app.f['primero']['ge'] = app.f['ale']['ge']; 
          }
        }
      }
      else{
        app.f['segundo']['eq'] = 'Alemania';
        app.f['segundo']['ptos'] = app.f['ale']['ptos'];
        app.f['segundo']['gf'] = app.f['ale']['gf'];
        app.f['segundo']['ge'] = app.f['ale']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.f['primero']['ptos'] < app.f['mex']['ptos']) {
        app.f['segundo']['eq'] = app.f['primero']['eq'];
        app.f['segundo']['ptos'] = app.f['primero']['ptos'];
        app.f['segundo']['gf'] = app.f['primero']['gf'];
        app.f['segundo']['ge'] = app.f['primero']['ge'];
        app.f['primero']['eq'] = 'México';
        app.f['primero']['ptos'] = app.f['mex']['ptos'];
        app.f['primero']['gf'] = app.f['mex']['gf'];
        app.f['primero']['ge'] = app.f['mex']['ge'];
      }
      else if (app.f['primero']['ptos'] == app.f['mex']['ptos']) {
        var difp = app.f['primero']['gf']-app.f['primero']['ge'];
        var difs = app.f['mex']['gf']-app.f['mex']['ge'];
        if (difp > difs) {
          app.f['segundo']['eq'] = 'México';
          app.f['segundo']['ptos'] = app.f['mex']['ptos'];
          app.f['segundo']['gf'] = app.f['mex']['gf'];
          app.f['segundo']['ge'] = app.f['mex']['ge'];
        }
        else if (difp < difs) {
          app.f['segundo']['eq'] = app.f['primero']['eq'];
          app.f['segundo']['ptos'] = app.f['primero']['ptos'];
          app.f['segundo']['gf'] = app.f['primero']['gf'];
          app.f['segundo']['ge'] = app.f['primero']['ge'];
          app.f['primero']['eq'] = 'México';
          app.f['primero']['ptos'] = app.f['mex']['ptos'];
          app.f['primero']['gf'] = app.f['mex']['gf'];
          app.f['primero']['ge'] = app.f['mex']['ge'];      
        }
        else{
          if (app.f['primero']['gf'] > app.f['mex']['gf']) {
            app.f['segundo']['eq'] = 'México';
            app.f['segundo']['ptos'] = app.f['mex']['ptos'];
            app.f['segundo']['gf'] = app.f['mex']['gf'];
            app.f['segundo']['ge'] = app.f['mex']['ge'];
          }
          else{
            app.f['segundo']['eq'] = app.f['primero']['eq'];
            app.f['segundo']['ptos'] = app.f['primero']['ptos'];
            app.f['segundo']['gf'] = app.f['primero']['gf'];
            app.f['segundo']['ge'] = app.f['primero']['ge'];
            app.f['primero']['eq'] = 'México';
            app.f['primero']['ptos'] = app.f['mex']['ptos'];
            app.f['primero']['gf'] = app.f['mex']['gf'];
            app.f['primero']['ge'] = app.f['mex']['ge']; 
          }
        }
      }
      else{
        if (app.f['segundo']['ptos'] < app.f['mex']['ptos']) {
          app.f['segundo']['eq'] = 'México';
          app.f['segundo']['ptos'] = app.f['mex']['ptos'];
          app.f['segundo']['gf'] = app.f['mex']['gf'];
          app.f['segundo']['ge'] = app.f['mex']['ge'];
        }
        else if (app.f['segundo']['ptos'] == app.f['mex']['ptos']) {
          var difp = app.f['segundo']['gf']-app.f['segundo']['ge'];
          var difs = app.f['mex']['gf']-app.f['mex']['ge'];
          if (difp < difs) {
            app.f['segundo']['eq'] = 'México';
            app.f['segundo']['ptos'] = app.f['mex']['ptos'];
            app.f['segundo']['gf'] = app.f['mex']['gf'];
            app.f['segundo']['ge'] = app.f['mex']['ge'];
          }
          else if (difp == difs) {
            if (app.f['segundo']['gf'] < app.f['mex']['gf']) {
              app.f['segundo']['eq'] = 'México';
              app.f['segundo']['ptos'] = app.f['mex']['ptos'];
              app.f['segundo']['gf'] = app.f['mex']['gf'];
              app.f['segundo']['ge'] = app.f['mex']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.f['primero']['ptos'] < app.f['cor']['ptos']) {
        app.f['segundo']['eq'] = app.f['primero']['eq'];
        app.f['segundo']['ptos'] = app.f['primero']['ptos'];
        app.f['segundo']['gf'] = app.f['primero']['gf'];
        app.f['segundo']['ge'] = app.f['primero']['ge'];
        app.f['primero']['eq'] = 'Corea del Sur';
        app.f['primero']['ptos'] = app.f['cor']['ptos'];
        app.f['primero']['gf'] = app.f['cor']['gf'];
        app.f['primero']['ge'] = app.f['cor']['ge'];
      }
      else if (app.f['primero']['ptos'] == app.f['cor']['ptos']) {
        var difp = app.f['primero']['gf']-app.f['primero']['ge'];
        var difs = app.f['cor']['gf']-app.f['cor']['ge'];
        if (difp > difs) {
          app.f['segundo']['eq'] = 'Corea del Sur';
          app.f['segundo']['ptos'] = app.f['cor']['ptos'];
          app.f['segundo']['gf'] = app.f['cor']['gf'];
          app.f['segundo']['ge'] = app.f['cor']['ge'];
        }
        else if (difp < difs) {
          app.f['segundo']['eq'] = app.f['primero']['eq'];
          app.f['segundo']['ptos'] = app.f['primero']['ptos'];
          app.f['segundo']['gf'] = app.f['primero']['gf'];
          app.f['segundo']['ge'] = app.f['primero']['ge'];
          app.f['primero']['eq'] = 'Corea del Sur';
          app.f['primero']['ptos'] = app.f['cor']['ptos'];
          app.f['primero']['gf'] = app.f['cor']['gf'];
          app.f['primero']['ge'] = app.f['cor']['ge'];      
        }
        else{
          if (app.f['primero']['gf'] > app.f['cor']['gf']) {
            app.f['segundo']['eq'] = 'Corea del Sur';
            app.f['segundo']['ptos'] = app.f['cor']['ptos'];
            app.f['segundo']['gf'] = app.f['cor']['gf'];
            app.f['segundo']['ge'] = app.f['cor']['ge'];
          }
          else{
            app.f['segundo']['eq'] = app.f['primero']['eq'];
            app.f['segundo']['ptos'] = app.f['primero']['ptos'];
            app.f['segundo']['gf'] = app.f['primero']['gf'];
            app.f['segundo']['ge'] = app.f['primero']['ge'];
            app.f['primero']['eq'] = 'Corea del Sur';
            app.f['primero']['ptos'] = app.f['cor']['ptos'];
            app.f['primero']['gf'] = app.f['cor']['gf'];
            app.f['primero']['ge'] = app.f['cor']['ge']; 
          }
        }
      }
      else{
        if (app.f['segundo']['ptos'] < app.f['cor']['ptos']) {
          app.f['segundo']['eq'] = 'Corea del Sur';
          app.f['segundo']['ptos'] = app.f['cor']['ptos'];
          app.f['segundo']['gf'] = app.f['cor']['gf'];
          app.f['segundo']['ge'] = app.f['cor']['ge'];
        }
        else if (app.f['segundo']['ptos'] == app.f['cor']['ptos']) {
          var difp = app.f['segundo']['gf']-app.f['segundo']['ge'];
          var difs = app.f['cor']['gf']-app.f['cor']['ge'];
          if (difp < difs) {
            app.f['segundo']['eq'] = 'Corea del Sur';
            app.f['segundo']['ptos'] = app.f['cor']['ptos'];
            app.f['segundo']['gf'] = app.f['cor']['gf'];
            app.f['segundo']['ge'] = app.f['cor']['ge'];
          }
          else if (difp == difs) {
            if (app.f['segundo']['gf'] < app.f['cor']['gf']) {
              app.f['segundo']['eq'] = 'Corea del Sur';
              app.f['segundo']['ptos'] = app.f['cor']['ptos'];
              app.f['segundo']['gf'] = app.f['cor']['gf'];
              app.f['segundo']['ge'] = app.f['cor']['ge'];
            }
          }
        }
      }

      document.getElementById('1f').value = app.f['primero']['eq'];
      document.getElementById('2f').value = app.f['segundo']['eq'];
    },

    calculateG:function(){
      app.g['bel']['ptos']=0;
      app.g['pan']['ptos']=0;
      app.g['tun']['ptos']=0;
      app.g['ing']['ptos']=0;

      app.g['bel']['gf'] = 0;
      app.g['bel']['ge'] = 0;

      app.g['pan']['gf'] = 0;
      app.g['pan']['ge'] = 0;

      app.g['tun']['gf'] = 0;
      app.g['tun']['ge'] = 0;

      app.g['ing']['gf'] = 0;
      app.g['ing']['ge'] = 0;

      var res1 = app.g['bel_pan'].split('-');
      if (res1[0] < res1[1]) {
        app.g['pan']['ptos'] += 3;
        app.g['bel']['gf'] += parseInt(res1[0]);
        app.g['bel']['ge'] += parseInt(res1[1]);
        app.g['pan']['gf'] += parseInt(res1[1]);
        app.g['pan']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.g['bel']['ptos'] += 3;
        app.g['bel']['gf'] += parseInt(res1[0]);
        app.g['bel']['ge'] += parseInt(res1[1]);
        app.g['pan']['gf'] += parseInt(res1[1]);
        app.g['pan']['ge'] += parseInt(res1[0]);
      }
      else {
        app.g['bel']['ptos'] += 1;
        app.g['pan']['ptos'] += 1;
        app.g['bel']['gf'] += parseInt(res1[0]);
        app.g['bel']['ge'] += parseInt(res1[1]);
        app.g['pan']['gf'] += parseInt(res1[1]);
        app.g['pan']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.g['tun_ing'].split('-');
      if (res2[0] < res2[1]) {
        app.g['ing']['ptos'] += 3;
        app.g['tun']['gf'] += parseInt(res2[0]);
        app.g['tun']['ge'] += parseInt(res2[1]);
        app.g['ing']['gf'] += parseInt(res2[1]);
        app.g['ing']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.g['tun']['ptos'] += 3;
        app.g['tun']['gf'] += parseInt(res2[0]);
        app.g['tun']['ge'] += parseInt(res2[1]);
        app.g['ing']['gf'] += parseInt(res2[1]);
        app.g['ing']['ge'] += parseInt(res2[0]);
      }
      else {
        app.g['tun']['ptos'] += 1;
        app.g['ing']['ptos'] += 1;
        app.g['tun']['gf'] += parseInt(res2[0]);
        app.g['tun']['ge'] += parseInt(res2[1]);
        app.g['ing']['gf'] += parseInt(res2[1]);
        app.g['ing']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.g['ing_pan'].split('-');
      if (res3[0] > res3[1]) {
        app.g['ing']['ptos'] += 3;
        app.g['ing']['gf'] += parseInt(res3[0]);
        app.g['ing']['ge'] += parseInt(res3[1]);
        app.g['pan']['gf'] += parseInt(res3[1]);
        app.g['pan']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.g['pan']['ptos'] += 3;
        app.g['pan']['gf'] += parseInt(res3[1]);
        app.g['pan']['ge'] += parseInt(res3[0]);
        app.g['ing']['gf'] += parseInt(res3[0]);
        app.g['ing']['ge'] += parseInt(res3[1]);
      }
      else {
        app.g['pan']['ptos'] += 1;
        app.g['ing']['ptos'] += 1;
        app.g['pan']['gf'] += parseInt(res3[1]);
        app.g['pan']['ge'] += parseInt(res3[0]);
        app.g['ing']['gf'] += parseInt(res3[0]);
        app.g['ing']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.g['bel_tun'].split('-');
      if (res4[0] > res4[1]) {
        app.g['bel']['ptos'] += 3;
        app.g['bel']['gf'] += parseInt(res4[0]);
        app.g['bel']['ge'] += parseInt(res4[1]);
        app.g['tun']['gf'] += parseInt(res4[1]);
        app.g['tun']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.g['tun']['ptos'] += 3;
        app.g['tun']['gf'] += parseInt(res4[1]);
        app.g['tun']['ge'] += parseInt(res4[0]);
        app.g['bel']['gf'] += parseInt(res4[0]);
        app.g['bel']['ge'] += parseInt(res4[1]);
      }
      else {
        app.g['tun']['ptos'] += 1;
        app.g['bel']['ptos'] += 1;
        app.g['tun']['gf'] += parseInt(res4[1]);
        app.g['tun']['ge'] += parseInt(res4[0]);
        app.g['bel']['gf'] += parseInt(res4[0]);
        app.g['bel']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.g['pan_tun'].split('-');
      if (res5[0] > res5[1]) {
        app.g['pan']['ptos'] += 3;
        app.g['pan']['gf'] += parseInt(res5[0]);
        app.g['pan']['ge'] += parseInt(res5[1]);
        app.g['tun']['gf'] += parseInt(res5[1]);
        app.g['tun']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.g['tun']['ptos'] += 3;
        app.g['tun']['gf'] += parseInt(res5[1]);
        app.g['tun']['ge'] += parseInt(res5[0]);
        app.g['pan']['gf'] += parseInt(res5[0]);
        app.g['pan']['ge'] += parseInt(res5[1]);
      }
      else {
        app.g['tun']['ptos'] += 1;
        app.g['pan']['ptos'] += 1;
        app.g['tun']['gf'] += parseInt(res5[1]);
        app.g['tun']['ge'] += parseInt(res5[0]);
        app.g['pan']['gf'] += parseInt(res5[0]);
        app.g['pan']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.g['ing_bel'].split('-');
      if (res6[0] > res6[1]) {
        app.g['ing']['ptos'] += 3;
        app.g['ing']['gf'] += parseInt(res6[0]);
        app.g['ing']['ge'] += parseInt(res6[1]);
        app.g['bel']['gf'] += parseInt(res6[1]);
        app.g['bel']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.g['bel']['ptos'] += 3;
        app.g['bel']['gf'] += parseInt(res6[1]);
        app.g['bel']['ge'] += parseInt(res6[0]);
        app.g['ing']['gf'] += parseInt(res6[0]);
        app.g['ing']['ge'] += parseInt(res6[1]);
      }
      else {
        app.g['bel']['ptos'] += 1;
        app.g['ing']['ptos'] += 1;
        app.g['bel']['gf'] += parseInt(res6[1]);
        app.g['bel']['ge'] += parseInt(res6[0]);
        app.g['ing']['gf'] += parseInt(res6[0]);
        app.g['ing']['ge'] += parseInt(res6[1]);
      }

      if (app.g['primero']['ptos'] < app.g['tun']['ptos']) {
        app.g['primero']['eq'] = 'Túnez';
        app.g['primero']['ptos'] = app.g['tun']['ptos'];
        app.g['primero']['gf'] = app.g['tun']['gf'];
        app.g['primero']['ge'] = app.g['tun']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.g['primero']['ptos'] < app.g['bel']['ptos']) {
        app.g['segundo']['eq'] = app.g['primero']['eq'];
        app.g['segundo']['ptos'] = app.g['primero']['ptos'];
        app.g['segundo']['gf'] = app.g['primero']['gf'];
        app.g['segundo']['ge'] = app.g['primero']['ge'];
        app.g['primero']['eq'] = 'Bélgica';
        app.g['primero']['ptos'] = app.g['bel']['ptos'];
        app.g['primero']['gf'] = app.g['bel']['gf'];
        app.g['primero']['ge'] = app.g['bel']['ge'];
      }
      else if (app.g['primero']['ptos'] == app.g['bel']['ptos']) {
        var difp = app.g['primero']['gf']-app.g['primero']['ge'];
        var difs = app.g['bel']['gf']-app.g['bel']['ge'];
        if (difp > difs) {
          app.g['segundo']['eq'] = 'Bélgica';
          app.g['segundo']['ptos'] = app.g['bel']['ptos'];
          app.g['segundo']['gf'] = app.g['bel']['gf'];
          app.g['segundo']['ge'] = app.g['bel']['ge'];
        }
        else if (difp < difs) {
          app.g['segundo']['eq'] = app.g['primero']['eq'];
          app.g['segundo']['ptos'] = app.g['primero']['ptos'];
          app.g['segundo']['gf'] = app.g['primero']['gf'];
          app.g['segundo']['ge'] = app.g['primero']['ge'];
          app.g['primero']['eq'] = 'Bélgica';
          app.g['primero']['ptos'] = app.g['bel']['ptos'];
          app.g['primero']['gf'] = app.g['bel']['gf'];
          app.g['primero']['ge'] = app.g['bel']['ge'];      
        }
        else{
          if (app.g['primero']['gf'] > app.g['bel']['gf']) {
            app.g['segundo']['eq'] = 'Bélgica';
            app.g['segundo']['ptos'] = app.g['bel']['ptos'];
            app.g['segundo']['gf'] = app.g['bel']['gf'];
            app.g['segundo']['ge'] = app.g['bel']['ge'];
          }
          else{
            app.g['segundo']['eq'] = app.g['primero']['eq'];
            app.g['segundo']['ptos'] = app.g['primero']['ptos'];
            app.g['segundo']['gf'] = app.g['primero']['gf'];
            app.g['segundo']['ge'] = app.g['primero']['ge'];
            app.g['primero']['eq'] = 'Bélgica';
            app.g['primero']['ptos'] = app.g['bel']['ptos'];
            app.g['primero']['gf'] = app.g['bel']['gf'];
            app.g['primero']['ge'] = app.g['bel']['ge']; 
          }
        }
      }
      else{
        app.g['segundo']['eq'] = 'Bélgica';
        app.g['segundo']['ptos'] = app.g['bel']['ptos'];
        app.g['segundo']['gf'] = app.g['bel']['gf'];
        app.g['segundo']['ge'] = app.g['bel']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.g['primero']['ptos'] < app.g['pan']['ptos']) {
        app.g['segundo']['eq'] = app.g['primero']['eq'];
        app.g['segundo']['ptos'] = app.g['primero']['ptos'];
        app.g['segundo']['gf'] = app.g['primero']['gf'];
        app.g['segundo']['ge'] = app.g['primero']['ge'];
        app.g['primero']['eq'] = 'Panamá';
        app.g['primero']['ptos'] = app.g['pan']['ptos'];
        app.g['primero']['gf'] = app.g['pan']['gf'];
        app.g['primero']['ge'] = app.g['pan']['ge'];
      }
      else if (app.g['primero']['ptos'] == app.g['pan']['ptos']) {
        var difp = app.g['primero']['gf']-app.g['primero']['ge'];
        var difs = app.g['pan']['gf']-app.g['pan']['ge'];
        if (difp > difs) {
          app.g['segundo']['eq'] = 'Panamá';
          app.g['segundo']['ptos'] = app.g['pan']['ptos'];
          app.g['segundo']['gf'] = app.g['pan']['gf'];
          app.g['segundo']['ge'] = app.g['pan']['ge'];
        }
        else if (difp < difs) {
          app.g['segundo']['eq'] = app.g['primero']['eq'];
          app.g['segundo']['ptos'] = app.g['primero']['ptos'];
          app.g['segundo']['gf'] = app.g['primero']['gf'];
          app.g['segundo']['ge'] = app.g['primero']['ge'];
          app.g['primero']['eq'] = 'Panamá';
          app.g['primero']['ptos'] = app.g['pan']['ptos'];
          app.g['primero']['gf'] = app.g['pan']['gf'];
          app.g['primero']['ge'] = app.g['pan']['ge'];      
        }
        else{
          if (app.g['primero']['gf'] > app.g['pan']['gf']) {
            app.g['segundo']['eq'] = 'Panamá';
            app.g['segundo']['ptos'] = app.g['pan']['ptos'];
            app.g['segundo']['gf'] = app.g['pan']['gf'];
            app.g['segundo']['ge'] = app.g['pan']['ge'];
          }
          else{
            app.g['segundo']['eq'] = app.g['primero']['eq'];
            app.g['segundo']['ptos'] = app.g['primero']['ptos'];
            app.g['segundo']['gf'] = app.g['primero']['gf'];
            app.g['segundo']['ge'] = app.g['primero']['ge'];
            app.g['primero']['eq'] = 'Panamá';
            app.g['primero']['ptos'] = app.g['pan']['ptos'];
            app.g['primero']['gf'] = app.g['pan']['gf'];
            app.g['primero']['ge'] = app.g['pan']['ge']; 
          }
        }
      }
      else{
        if (app.g['segundo']['ptos'] < app.g['pan']['ptos']) {
          app.g['segundo']['eq'] = 'Panamá';
          app.g['segundo']['ptos'] = app.g['pan']['ptos'];
          app.g['segundo']['gf'] = app.g['pan']['gf'];
          app.g['segundo']['ge'] = app.g['pan']['ge'];
        }
        else if (app.g['segundo']['ptos'] == app.g['pan']['ptos']) {
          var difp = app.g['segundo']['gf']-app.g['segundo']['ge'];
          var difs = app.g['pan']['gf']-app.g['pan']['ge'];
          if (difp < difs) {
            app.g['segundo']['eq'] = 'Panamá';
            app.g['segundo']['ptos'] = app.g['pan']['ptos'];
            app.g['segundo']['gf'] = app.g['pan']['gf'];
            app.g['segundo']['ge'] = app.g['pan']['ge'];
          }
          else if (difp == difs) {
            if (app.g['segundo']['gf'] < app.g['pan']['gf']) {
              app.g['segundo']['eq'] = 'Panamá';
              app.g['segundo']['ptos'] = app.g['pan']['ptos'];
              app.g['segundo']['gf'] = app.g['pan']['gf'];
              app.g['segundo']['ge'] = app.g['pan']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.g['primero']['ptos'] < app.g['ing']['ptos']) {
        app.g['segundo']['eq'] = app.g['primero']['eq'];
        app.g['segundo']['ptos'] = app.g['primero']['ptos'];
        app.g['segundo']['gf'] = app.g['primero']['gf'];
        app.g['segundo']['ge'] = app.g['primero']['ge'];
        app.g['primero']['eq'] = 'Inglaterra';
        app.g['primero']['ptos'] = app.g['ing']['ptos'];
        app.g['primero']['gf'] = app.g['ing']['gf'];
        app.g['primero']['ge'] = app.g['ing']['ge'];
      }
      else if (app.g['primero']['ptos'] == app.g['ing']['ptos']) {
        var difp = app.g['primero']['gf']-app.g['primero']['ge'];
        var difs = app.g['ing']['gf']-app.g['ing']['ge'];
        if (difp > difs) {
          app.g['segundo']['eq'] = 'Inglaterra';
          app.g['segundo']['ptos'] = app.g['ing']['ptos'];
          app.g['segundo']['gf'] = app.g['ing']['gf'];
          app.g['segundo']['ge'] = app.g['ing']['ge'];
        }
        else if (difp < difs) {
          app.g['segundo']['eq'] = app.g['primero']['eq'];
          app.g['segundo']['ptos'] = app.g['primero']['ptos'];
          app.g['segundo']['gf'] = app.g['primero']['gf'];
          app.g['segundo']['ge'] = app.g['primero']['ge'];
          app.g['primero']['eq'] = 'Inglaterra';
          app.g['primero']['ptos'] = app.g['ing']['ptos'];
          app.g['primero']['gf'] = app.g['ing']['gf'];
          app.g['primero']['ge'] = app.g['ing']['ge'];      
        }
        else{
          if (app.g['primero']['gf'] > app.g['ing']['gf']) {
            app.g['segundo']['eq'] = 'Inglaterra';
            app.g['segundo']['ptos'] = app.g['ing']['ptos'];
            app.g['segundo']['gf'] = app.g['ing']['gf'];
            app.g['segundo']['ge'] = app.g['ing']['ge'];
          }
          else{
            app.g['segundo']['eq'] = app.g['primero']['eq'];
            app.g['segundo']['ptos'] = app.g['primero']['ptos'];
            app.g['segundo']['gf'] = app.g['primero']['gf'];
            app.g['segundo']['ge'] = app.g['primero']['ge'];
            app.g['primero']['eq'] = 'Inglaterra';
            app.g['primero']['ptos'] = app.g['ing']['ptos'];
            app.g['primero']['gf'] = app.g['ing']['gf'];
            app.g['primero']['ge'] = app.g['ing']['ge']; 
          }
        }
      }
      else{
        if (app.g['segundo']['ptos'] < app.g['ing']['ptos']) {
          app.g['segundo']['eq'] = 'Inglaterra';
          app.g['segundo']['ptos'] = app.g['ing']['ptos'];
          app.g['segundo']['gf'] = app.g['ing']['gf'];
          app.g['segundo']['ge'] = app.g['ing']['ge'];
        }
        else if (app.g['segundo']['ptos'] == app.g['ing']['ptos']) {
          var difp = app.g['segundo']['gf']-app.g['segundo']['ge'];
          var difs = app.g['ing']['gf']-app.g['ing']['ge'];
          if (difp < difs) {
            app.g['segundo']['eq'] = 'Inglaterra';
            app.g['segundo']['ptos'] = app.g['ing']['ptos'];
            app.g['segundo']['gf'] = app.g['ing']['gf'];
            app.g['segundo']['ge'] = app.g['ing']['ge'];
          }
          else if (difp == difs) {
            if (app.g['segundo']['gf'] < app.g['ing']['gf']) {
              app.g['segundo']['eq'] = 'Inglaterra';
              app.g['segundo']['ptos'] = app.g['ing']['ptos'];
              app.g['segundo']['gf'] = app.g['ing']['gf'];
              app.g['segundo']['ge'] = app.g['ing']['ge'];
            }
          }
        }
      }

      document.getElementById('1g').value = app.g['primero']['eq'];
      document.getElementById('2g').value = app.g['segundo']['eq'];
    },

    calculateH:function(){
      app.h['pol']['ptos']=0;
      app.h['sen']['ptos']=0;
      app.h['col']['ptos']=0;
      app.h['jap']['ptos']=0;

      app.h['pol']['gf'] = 0;
      app.h['pol']['ge'] = 0;

      app.h['sen']['gf'] = 0;
      app.h['sen']['ge'] = 0;

      app.h['col']['gf'] = 0;
      app.h['col']['ge'] = 0;

      app.h['jap']['gf'] = 0;
      app.h['jap']['ge'] = 0;

      var res1 = app.h['pol_sen'].split('-');
      if (res1[0] < res1[1]) {
        app.h['sen']['ptos'] += 3;
        app.h['pol']['gf'] += parseInt(res1[0]);
        app.h['pol']['ge'] += parseInt(res1[1]);
        app.h['sen']['gf'] += parseInt(res1[1]);
        app.h['sen']['ge'] += parseInt(res1[0]);
      }
      else if (res1[0] > res1[1]) {
        app.h['pol']['ptos'] += 3;
        app.h['pol']['gf'] += parseInt(res1[0]);
        app.h['pol']['ge'] += parseInt(res1[1]);
        app.h['sen']['gf'] += parseInt(res1[1]);
        app.h['sen']['ge'] += parseInt(res1[0]);
      }
      else {
        app.h['pol']['ptos'] += 1;
        app.h['sen']['ptos'] += 1;
        app.h['pol']['gf'] += parseInt(res1[0]);
        app.h['pol']['ge'] += parseInt(res1[1]);
        app.h['sen']['gf'] += parseInt(res1[1]);
        app.h['sen']['ge'] += parseInt(res1[0]);
      }
      //////////////////////////////////////////
      var res2 = app.h['col_jap'].split('-');
      if (res2[0] < res2[1]) {
        app.h['jap']['ptos'] += 3;
        app.h['col']['gf'] += parseInt(res2[0]);
        app.h['col']['ge'] += parseInt(res2[1]);
        app.h['jap']['gf'] += parseInt(res2[1]);
        app.h['jap']['ge'] += parseInt(res2[0]);
      }
      else if (res2[0] > res2[1]) {
        app.h['col']['ptos'] += 3;
        app.h['col']['gf'] += parseInt(res2[0]);
        app.h['col']['ge'] += parseInt(res2[1]);
        app.h['jap']['gf'] += parseInt(res2[1]);
        app.h['jap']['ge'] += parseInt(res2[0]);
      }
      else {
        app.h['col']['ptos'] += 1;
        app.h['jap']['ptos'] += 1;
        app.h['col']['gf'] += parseInt(res2[0]);
        app.h['col']['ge'] += parseInt(res2[1]);
        app.h['jap']['gf'] += parseInt(res2[1]);
        app.h['jap']['ge'] += parseInt(res2[0]);
      }
      //////////////////////////////////////////
      var res3 = app.h['jap_sen'].split('-');
      if (res3[0] > res3[1]) {
        app.h['jap']['ptos'] += 3;
        app.h['jap']['gf'] += parseInt(res3[0]);
        app.h['jap']['ge'] += parseInt(res3[1]);
        app.h['sen']['gf'] += parseInt(res3[1]);
        app.h['sen']['ge'] += parseInt(res3[0]);
      }
      else if (res3[0] < res3[1]) {
        app.h['sen']['ptos'] += 3;
        app.h['sen']['gf'] += parseInt(res3[1]);
        app.h['sen']['ge'] += parseInt(res3[0]);
        app.h['jap']['gf'] += parseInt(res3[0]);
        app.h['jap']['ge'] += parseInt(res3[1]);
      }
      else {
        app.h['sen']['ptos'] += 1;
        app.h['jap']['ptos'] += 1;
        app.h['sen']['gf'] += parseInt(res3[1]);
        app.h['sen']['ge'] += parseInt(res3[0]);
        app.h['jap']['gf'] += parseInt(res3[0]);
        app.h['jap']['ge'] += parseInt(res3[1]);
      }
      //////////////////////////////////////////
      var res4 = app.h['pol_col'].split('-');
      if (res4[0] > res4[1]) {
        app.h['pol']['ptos'] += 3;
        app.h['pol']['gf'] += parseInt(res4[0]);
        app.h['pol']['ge'] += parseInt(res4[1]);
        app.h['col']['gf'] += parseInt(res4[1]);
        app.h['col']['ge'] += parseInt(res4[0]);
      }
      else if (res4[0] < res4[1]) {
        app.h['col']['ptos'] += 3;
        app.h['col']['gf'] += parseInt(res4[1]);
        app.h['col']['ge'] += parseInt(res4[0]);
        app.h['pol']['gf'] += parseInt(res4[0]);
        app.h['pol']['ge'] += parseInt(res4[1]);
      }
      else {
        app.h['col']['ptos'] += 1;
        app.h['pol']['ptos'] += 1;
        app.h['col']['gf'] += parseInt(res4[1]);
        app.h['col']['ge'] += parseInt(res4[0]);
        app.h['pol']['gf'] += parseInt(res4[0]);
        app.h['pol']['ge'] += parseInt(res4[1]);
      }
      //////////////////////////////////////////
      var res5 = app.h['sen_col'].split('-');
      if (res5[0] > res5[1]) {
        app.h['sen']['ptos'] += 3;
        app.h['sen']['gf'] += parseInt(res5[0]);
        app.h['sen']['ge'] += parseInt(res5[1]);
        app.h['col']['gf'] += parseInt(res5[1]);
        app.h['col']['ge'] += parseInt(res5[0]);
      }
      else if (res5[0] < res5[1]) {
        app.h['col']['ptos'] += 3;
        app.h['col']['gf'] += parseInt(res5[1]);
        app.h['col']['ge'] += parseInt(res5[0]);
        app.h['sen']['gf'] += parseInt(res5[0]);
        app.h['sen']['ge'] += parseInt(res5[1]);
      }
      else {
        app.h['col']['ptos'] += 1;
        app.h['sen']['ptos'] += 1;
        app.h['col']['gf'] += parseInt(res5[1]);
        app.h['col']['ge'] += parseInt(res5[0]);
        app.h['sen']['gf'] += parseInt(res5[0]);
        app.h['sen']['ge'] += parseInt(res5[1]);
      }
      //////////////////////////////////////////
      var res6 = app.h['jap_pol'].split('-');
      if (res6[0] > res6[1]) {
        app.h['jap']['ptos'] += 3;
        app.h['jap']['gf'] += parseInt(res6[0]);
        app.h['jap']['ge'] += parseInt(res6[1]);
        app.h['pol']['gf'] += parseInt(res6[1]);
        app.h['pol']['ge'] += parseInt(res6[0]);
      }
      else if (res6[0] < res6[1]) {
        app.h['pol']['ptos'] += 3;
        app.h['pol']['gf'] += parseInt(res6[1]);
        app.h['pol']['ge'] += parseInt(res6[0]);
        app.h['jap']['gf'] += parseInt(res6[0]);
        app.h['jap']['ge'] += parseInt(res6[1]);
      }
      else {
        app.h['pol']['ptos'] += 1;
        app.h['jap']['ptos'] += 1;
        app.h['pol']['gf'] += parseInt(res6[1]);
        app.h['pol']['ge'] += parseInt(res6[0]);
        app.h['jap']['gf'] += parseInt(res6[0]);
        app.h['jap']['ge'] += parseInt(res6[1]);
      }

      if (app.h['primero']['ptos'] < app.h['col']['ptos']) {
        app.h['primero']['eq'] = 'Colombia';
        app.h['primero']['ptos'] = app.h['col']['ptos'];
        app.h['primero']['gf'] = app.h['col']['gf'];
        app.h['primero']['ge'] = app.h['col']['ge'];
      }
      /////////////////////////////////////////////////////////////////
      if (app.h['primero']['ptos'] < app.h['pol']['ptos']) {
        app.h['segundo']['eq'] = app.h['primero']['eq'];
        app.h['segundo']['ptos'] = app.h['primero']['ptos'];
        app.h['segundo']['gf'] = app.h['primero']['gf'];
        app.h['segundo']['ge'] = app.h['primero']['ge'];
        app.h['primero']['eq'] = 'Polonia';
        app.h['primero']['ptos'] = app.h['pol']['ptos'];
        app.h['primero']['gf'] = app.h['pol']['gf'];
        app.h['primero']['ge'] = app.h['pol']['ge'];
      }
      else if (app.h['primero']['ptos'] == app.h['pol']['ptos']) {
        var difp = app.h['primero']['gf']-app.h['primero']['ge'];
        var difs = app.h['pol']['gf']-app.h['pol']['ge'];
        if (difp > difs) {
          app.h['segundo']['eq'] = 'Polonia';
          app.h['segundo']['ptos'] = app.h['pol']['ptos'];
          app.h['segundo']['gf'] = app.h['pol']['gf'];
          app.h['segundo']['ge'] = app.h['pol']['ge'];
        }
        else if (difp < difs) {
          app.h['segundo']['eq'] = app.h['primero']['eq'];
          app.h['segundo']['ptos'] = app.h['primero']['ptos'];
          app.h['segundo']['gf'] = app.h['primero']['gf'];
          app.h['segundo']['ge'] = app.h['primero']['ge'];
          app.h['primero']['eq'] = 'Polonia';
          app.h['primero']['ptos'] = app.h['pol']['ptos'];
          app.h['primero']['gf'] = app.h['pol']['gf'];
          app.h['primero']['ge'] = app.h['pol']['ge'];      
        }
        else{
          if (app.h['primero']['gf'] > app.h['pol']['gf']) {
            app.h['segundo']['eq'] = 'Polonia';
            app.h['segundo']['ptos'] = app.h['pol']['ptos'];
            app.h['segundo']['gf'] = app.h['pol']['gf'];
            app.h['segundo']['ge'] = app.h['pol']['ge'];
          }
          else{
            app.h['segundo']['eq'] = app.h['primero']['eq'];
            app.h['segundo']['ptos'] = app.h['primero']['ptos'];
            app.h['segundo']['gf'] = app.h['primero']['gf'];
            app.h['segundo']['ge'] = app.h['primero']['ge'];
            app.h['primero']['eq'] = 'Polonia';
            app.h['primero']['ptos'] = app.h['pol']['ptos'];
            app.h['primero']['gf'] = app.h['pol']['gf'];
            app.h['primero']['ge'] = app.h['pol']['ge']; 
          }
        }
      }
      else{
        app.h['segundo']['eq'] = 'Polonia';
        app.h['segundo']['ptos'] = app.h['pol']['ptos'];
        app.h['segundo']['gf'] = app.h['pol']['gf'];
        app.h['segundo']['ge'] = app.h['pol']['ge'];
      }
      ////////////////////////////////////////////////////////////////////
      if (app.h['primero']['ptos'] < app.h['sen']['ptos']) {
        app.h['segundo']['eq'] = app.h['primero']['eq'];
        app.h['segundo']['ptos'] = app.h['primero']['ptos'];
        app.h['segundo']['gf'] = app.h['primero']['gf'];
        app.h['segundo']['ge'] = app.h['primero']['ge'];
        app.h['primero']['eq'] = 'Senegal';
        app.h['primero']['ptos'] = app.h['sen']['ptos'];
        app.h['primero']['gf'] = app.h['sen']['gf'];
        app.h['primero']['ge'] = app.h['sen']['ge'];
      }
      else if (app.h['primero']['ptos'] == app.h['sen']['ptos']) {
        var difp = app.h['primero']['gf']-app.h['primero']['ge'];
        var difs = app.h['sen']['gf']-app.h['sen']['ge'];
        if (difp > difs) {
          app.h['segundo']['eq'] = 'Senegal';
          app.h['segundo']['ptos'] = app.h['sen']['ptos'];
          app.h['segundo']['gf'] = app.h['sen']['gf'];
          app.h['segundo']['ge'] = app.h['sen']['ge'];
        }
        else if (difp < difs) {
          app.h['segundo']['eq'] = app.h['primero']['eq'];
          app.h['segundo']['ptos'] = app.h['primero']['ptos'];
          app.h['segundo']['gf'] = app.h['primero']['gf'];
          app.h['segundo']['ge'] = app.h['primero']['ge'];
          app.h['primero']['eq'] = 'Senegal';
          app.h['primero']['ptos'] = app.h['sen']['ptos'];
          app.h['primero']['gf'] = app.h['sen']['gf'];
          app.h['primero']['ge'] = app.h['sen']['ge'];      
        }
        else{
          if (app.h['primero']['gf'] > app.h['sen']['gf']) {
            app.h['segundo']['eq'] = 'Senegal';
            app.h['segundo']['ptos'] = app.h['sen']['ptos'];
            app.h['segundo']['gf'] = app.h['sen']['gf'];
            app.h['segundo']['ge'] = app.h['sen']['ge'];
          }
          else{
            app.h['segundo']['eq'] = app.h['primero']['eq'];
            app.h['segundo']['ptos'] = app.h['primero']['ptos'];
            app.h['segundo']['gf'] = app.h['primero']['gf'];
            app.h['segundo']['ge'] = app.h['primero']['ge'];
            app.h['primero']['eq'] = 'Senegal';
            app.h['primero']['ptos'] = app.h['sen']['ptos'];
            app.h['primero']['gf'] = app.h['sen']['gf'];
            app.h['primero']['ge'] = app.h['sen']['ge']; 
          }
        }
      }
      else{
        if (app.h['segundo']['ptos'] < app.h['sen']['ptos']) {
          app.h['segundo']['eq'] = 'Senegal';
          app.h['segundo']['ptos'] = app.h['sen']['ptos'];
          app.h['segundo']['gf'] = app.h['sen']['gf'];
          app.h['segundo']['ge'] = app.h['sen']['ge'];
        }
        else if (app.h['segundo']['ptos'] == app.h['sen']['ptos']) {
          var difp = app.h['segundo']['gf']-app.h['segundo']['ge'];
          var difs = app.h['sen']['gf']-app.h['sen']['ge'];
          if (difp < difs) {
            app.h['segundo']['eq'] = 'Senegal';
            app.h['segundo']['ptos'] = app.h['sen']['ptos'];
            app.h['segundo']['gf'] = app.h['sen']['gf'];
            app.h['segundo']['ge'] = app.h['sen']['ge'];
          }
          else if (difp == difs) {
            if (app.h['segundo']['gf'] < app.h['sen']['gf']) {
              app.h['segundo']['eq'] = 'Senegal';
              app.h['segundo']['ptos'] = app.h['sen']['ptos'];
              app.h['segundo']['gf'] = app.h['sen']['gf'];
              app.h['segundo']['ge'] = app.h['sen']['ge'];
            }
          }
        }
      }
      ///////////////////////////////////////////////////////////
      if (app.h['primero']['ptos'] < app.h['jap']['ptos']) {
        app.h['segundo']['eq'] = app.h['primero']['eq'];
        app.h['segundo']['ptos'] = app.h['primero']['ptos'];
        app.h['segundo']['gf'] = app.h['primero']['gf'];
        app.h['segundo']['ge'] = app.h['primero']['ge'];
        app.h['primero']['eq'] = 'Japón';
        app.h['primero']['ptos'] = app.h['jap']['ptos'];
        app.h['primero']['gf'] = app.h['jap']['gf'];
        app.h['primero']['ge'] = app.h['jap']['ge'];
      }
      else if (app.h['primero']['ptos'] == app.h['jap']['ptos']) {
        var difp = app.h['primero']['gf']-app.h['primero']['ge'];
        var difs = app.h['jap']['gf']-app.h['jap']['ge'];
        if (difp > difs) {
          app.h['segundo']['eq'] = 'Japón';
          app.h['segundo']['ptos'] = app.h['jap']['ptos'];
          app.h['segundo']['gf'] = app.h['jap']['gf'];
          app.h['segundo']['ge'] = app.h['jap']['ge'];
        }
        else if (difp < difs) {
          app.h['segundo']['eq'] = app.h['primero']['eq'];
          app.h['segundo']['ptos'] = app.h['primero']['ptos'];
          app.h['segundo']['gf'] = app.h['primero']['gf'];
          app.h['segundo']['ge'] = app.h['primero']['ge'];
          app.h['primero']['eq'] = 'Japón';
          app.h['primero']['ptos'] = app.h['jap']['ptos'];
          app.h['primero']['gf'] = app.h['jap']['gf'];
          app.h['primero']['ge'] = app.h['jap']['ge'];      
        }
        else{
          if (app.h['primero']['gf'] > app.h['jap']['gf']) {
            app.h['segundo']['eq'] = 'Japón';
            app.h['segundo']['ptos'] = app.h['jap']['ptos'];
            app.h['segundo']['gf'] = app.h['jap']['gf'];
            app.h['segundo']['ge'] = app.h['jap']['ge'];
          }
          else{
            app.h['segundo']['eq'] = app.h['primero']['eq'];
            app.h['segundo']['ptos'] = app.h['primero']['ptos'];
            app.h['segundo']['gf'] = app.h['primero']['gf'];
            app.h['segundo']['ge'] = app.h['primero']['ge'];
            app.h['primero']['eq'] = 'Japón';
            app.h['primero']['ptos'] = app.h['jap']['ptos'];
            app.h['primero']['gf'] = app.h['jap']['gf'];
            app.h['primero']['ge'] = app.h['jap']['ge']; 
          }
        }
      }
      else{
        if (app.h['segundo']['ptos'] < app.h['jap']['ptos']) {
          app.h['segundo']['eq'] = 'Japón';
          app.h['segundo']['ptos'] = app.h['jap']['ptos'];
          app.h['segundo']['gf'] = app.h['jap']['gf'];
          app.h['segundo']['ge'] = app.h['jap']['ge'];
        }
        else if (app.h['segundo']['ptos'] == app.h['jap']['ptos']) {
          var difp = app.h['segundo']['gf']-app.h['segundo']['ge'];
          var difs = app.h['jap']['gf']-app.h['jap']['ge'];
          if (difp < difs) {
            app.h['segundo']['eq'] = 'Japón';
            app.h['segundo']['ptos'] = app.h['jap']['ptos'];
            app.h['segundo']['gf'] = app.h['jap']['gf'];
            app.h['segundo']['ge'] = app.h['jap']['ge'];
          }
          else if (difp == difs) {
            if (app.h['segundo']['gf'] < app.h['jap']['gf']) {
              app.h['segundo']['eq'] = 'Japón';
              app.h['segundo']['ptos'] = app.h['jap']['ptos'];
              app.h['segundo']['gf'] = app.h['jap']['gf'];
              app.h['segundo']['ge'] = app.h['jap']['ge'];
            }
          }
        }
      }

      document.getElementById('1h').value = app.h['primero']['eq'];
      document.getElementById('2h').value = app.h['segundo']['eq'];
    },

    sendata:function(){
      var camp = document.getElementById('campeon').value;
      var subcamp = document.getElementById('subcampeon').value;
      var tercerpuesto = document.getElementById('tercerpuesto').value;
      var cuartopuesto = document.getElementById('cuartopuesto').value;
      var user = document.getElementById('user').value;
      var gol = document.getElementById('gol').value;
      var aux = 0;
      if (camp == "" || subcamp == "" || tercerpuesto == "" || cuartopuesto == "" || gol == "") {
        $("#myModal1").modal('show');
      }
      else{
        for(var key in app.model){
          if (app.model[key]['user'].replace(' ','').toLowerCase() === user.replace(' ','').toLowerCase()) {
            aux = 1;
          }
        }
        if (aux) {
          $("#myModal2").modal('show');
        }
        else{
          firebase.database().ref().push({
            user:user,
            camp:camp,
            subcamp:subcamp,
            tercerpuesto:tercerpuesto,
            cuartopuesto:cuartopuesto,
            a:app.a,
            b:app.b,
            c:app.c,
            d:app.d,
            e:app.e,
            f:app.f,
            g:app.g,
            h:app.h,
            ptos:0,
            gol:gol,
          });
          document.getElementById('usuario').innerHTML = user;
          $("#myModal4").modal('show');
          app.clear();
        }
      }
    },

    clear:function(){
      $(':input').val('');
      document.getElementById("grupos").style.display = "inline";
      document.getElementById("eliminatoria").style.display = "none";
      document.getElementById("posiciones").style.display = "none";
    },

    atras:function(){
      document.getElementById("grupos").style.display = "inline";
      document.getElementById("eliminatoria").style.display = "none";
      document.getElementById("posiciones").style.display = "none";
    },

    poss:function(){
      document.getElementById("grupos").style.display = "none";
      document.getElementById("eliminatoria").style.display = "none";
      document.getElementById("posiciones").style.display = "inline";
      app.refreshUsers();
    },

    refreshUsers:function(){
      var users = [];
      for(var key in app.model){
        var data = [];
        var aux = 0;
        var ptos = 0;
        if (app.model[key]['user'] == 'master-master') {
          aux = 1;
        }
        else{
          data.push(app.model[key]['user']);
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['a']['rus_ars']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['a']['rus_ars'] == app.model[key]['a']['rus_ars']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['a']['rus_ars'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['a']['rus_ars'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['a']['egi_uru']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['a']['egi_uru'] == app.model[key]['a']['egi_uru']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['a']['egi_uru'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['a']['egi_uru'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['b']['mar_ira']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['b']['mar_ira'] == app.model[key]['b']['mar_ira']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['b']['mar_ira'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['b']['mar_ira'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['b']['por_esp']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['b']['por_esp'] == app.model[key]['b']['por_esp']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['b']['por_esp'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['b']['por_esp'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['c']['fra_aus']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['c']['fra_aus'] == app.model[key]['c']['fra_aus']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['c']['fra_aus'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['c']['fra_aus'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['d']['arg_isl']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['d']['arg_isl'] == app.model[key]['d']['arg_isl']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['d']['arg_isl'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['d']['arg_isl'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['c']['per_din']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['c']['per_din'] == app.model[key]['c']['per_din']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['c']['per_din'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['c']['per_din'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['d']['cro_nig']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['d']['cro_nig'] == app.model[key]['d']['cro_nig']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['d']['cro_nig'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['d']['cro_nig'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['e']['cos_ser']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['e']['cos_ser'] == app.model[key]['e']['cos_ser']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['e']['cos_ser'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['e']['cos_ser'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['f']['ale_mex']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['f']['ale_mex'] == app.model[key]['f']['ale_mex']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['f']['ale_mex'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['f']['ale_mex'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['e']['bra_sui']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['e']['bra_sui'] == app.model[key]['e']['bra_sui']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['e']['bra_sui'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['e']['bra_sui'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['f']['sue_cor']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['f']['sue_cor'] == app.model[key]['f']['sue_cor']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['f']['sue_cor'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['f']['sue_cor'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['g']['bel_pan']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['g']['bel_pan'] == app.model[key]['g']['bel_pan']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['g']['bel_pan'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['g']['bel_pan'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['g']['tun_ing']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['g']['tun_ing'] == app.model[key]['g']['tun_ing']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['g']['tun_ing'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['g']['tun_ing'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['h']['pol_sen']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_sen'] == app.model[key]['h']['pol_sen']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['h']['pol_sen'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_sen'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['h']['col_jap']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['h']['col_jap'] == app.model[key]['h']['col_jap']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['h']['col_jap'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['h']['col_jap'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['a']['rus_egi']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['a']['rus_egi'] == app.model[key]['a']['rus_egi']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['a']['rus_egi'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['a']['rus_egi'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['b']['por_mar']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['b']['por_mar'] == app.model[key]['b']['por_mar']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['b']['por_mar'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['b']['por_mar'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['a']['uru_ars']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['a']['uru_ars'] == app.model[key]['a']['uru_ars']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['a']['uru_ars'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['a']['uru_ars'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['b']['ira_esp']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['b']['ira_esp'] == app.model[key]['b']['ira_esp']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['b']['ira_esp'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['b']['ira_esp'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['c']['fra_per']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['c']['fra_per'] == app.model[key]['c']['fra_per']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['c']['fra_per'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['c']['fra_per'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['c']['din_aus']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['c']['din_aus'] == app.model[key]['c']['din_aus']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['c']['din_aus'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['c']['din_aus'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['d']['arg_cro']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['d']['arg_cro'] == app.model[key]['d']['arg_cro']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['d']['arg_cro'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['d']['arg_cro'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['e']['bra_cos']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['e']['bra_cos'] == app.model[key]['e']['bra_cos']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['e']['bra_cos'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['e']['bra_cos'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['d']['nig_isl']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['d']['nig_isl'] == app.model[key]['d']['nig_isl']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['d']['nig_isl'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['d']['nig_isl'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['e']['ser_sui']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['e']['ser_sui'] == app.model[key]['e']['ser_sui']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['e']['ser_sui'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['e']['ser_sui'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['g']['bel_tun']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['g']['bel_tun'] == app.model[key]['g']['bel_tun']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['g']['bel_tun'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['g']['bel_tun'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['f']['ale_sue']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['f']['ale_sue'] == app.model[key]['f']['ale_sue']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['f']['ale_sue'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['f']['ale_sue'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['f']['cor_mex']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['f']['cor_mex'] == app.model[key]['f']['cor_mex']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['f']['cor_mex'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['f']['cor_mex'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['g']['ing_pan']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['g']['ing_pan'] == app.model[key]['g']['ing_pan']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['g']['ing_pan'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['g']['ing_pan'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['h']['jap_sen']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['h']['jap_sen'] == app.model[key]['h']['jap_sen']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['h']['jap_sen'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['h']['jap_sen'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['h']['pol_col']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_col'] == app.model[key]['h']['pol_col']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['h']['pol_col'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_col'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['a']['ars_egi']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['a']['ars_egi'] == app.model[key]['a']['ars_egi']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['a']['ars_egi'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['a']['ars_egi'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['a']['uru_rus']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['a']['uru_ars'] == app.model[key]['a']['uru_ars']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['a']['uru_ars'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['a']['uru_ars'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['b']['esp_mar']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['b']['esp_mar'] == app.model[key]['b']['esp_mar']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['b']['esp_mar'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['b']['esp_mar'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['b']['ira_por']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['b']['ira_por'] == app.model[key]['b']['ira_por']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['b']['ira_por'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['b']['ira_por'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['c']['aus_per']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['c']['aus_per'] == app.model[key]['c']['aus_per']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['c']['aus_per'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['c']['aus_per'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['c']['din_fra']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['c']['din_fra'] == app.model[key]['c']['din_fra']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['c']['din_fra'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['c']['din_fra'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['d']['isl_cro']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['d']['isl_cro'] == app.model[key]['d']['isl_cro']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['d']['isl_cro'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['d']['isl_cro'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['d']['nig_arg']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['d']['nig_arg'] == app.model[key]['d']['nig_arg']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['d']['nig_arg'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['d']['nig_arg'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['f']['mex_sue']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['f']['mex_sue'] == app.model[key]['f']['mex_sue']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['f']['mex_sue'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['f']['mex_sue'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['f']['cor_ale']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['f']['cor_ale'] == app.model[key]['f']['cor_ale']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['f']['cor_ale'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['f']['cor_ale'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['e']['sui_cos']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['e']['sui_cos'] == app.model[key]['e']['sui_cos']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['e']['sui_cos'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['e']['sui_cos'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['e']['ser_bra']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['e']['ser_bra'] == app.model[key]['e']['ser_bra']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['e']['ser_bra'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['e']['ser_bra'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['h']['sen_col']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['h']['sen_col'] == app.model[key]['h']['sen_col']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['h']['sen_col'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['h']['sen_col'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['h']['jap_pol']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['h']['jap_pol'] == app.model[key]['h']['jap_pol']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['h']['jap_pol'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['h']['jap_pol'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['g']['pan_tun']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['g']['pan_tun'] == app.model[key]['g']['pan_tun']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['g']['pan_tun'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['g']['pan_tun'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['g']['ing_bel']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['g']['ing_bel'] == app.model[key]['g']['ing_bel']) {
            ptos += 5;
          }
          else{
            var usr = app.model[key]['g']['ing_bel'].split('-');
            var mstr = app.model['-LE7QFSuDWcx4trbkLGQ']['g']['ing_bel'].split('-');
            if (usr[0] > usr[1] && mstr[0] > mstr[1] || usr[0] < usr[1] && mstr[0] < mstr[1] || usr[0] == usr[1] && mstr[0] == mstr[1]) {
              ptos += 3;
            }
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          if (app.model[key]['camp'] === "Bélgica") {
            app.model[key]['camp'] = "Belgica";
          }
          if (app.model[key]['subcamp'] === "Bélgica") {
            app.model[key]['subcamp'] = "Belgica";
          }
          if (app.model[key]['tercerpuesto'] === "Bélgica") {
            app.model[key]['tercerpuesto'] = "Belgica";
          }
          if (app.model[key]['cuartopuesto'] === "Bélgica") {
            app.model[key]['cuartopuesto'] = "Belgica";
          }
          data.push(app.model[key]['camp']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['camp'].toLowerCase() == app.model[key]['camp'].toLowerCase()) {
            ptos += 20;
          }
          else if (app.model[key]['camp'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['subcamp'].toLowerCase() || app.model[key]['camp'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['tercerpuesto'].toLowerCase() || app.model[key]['camp'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['cuartopuesto'].toLowerCase()) {
            ptos += 10;
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['subcamp']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['subcamp'].toLowerCase() == app.model[key]['subcamp'].toLowerCase()) {
            ptos += 20;
          }
          else if (app.model[key]['subcamp'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['camp'].toLowerCase() || app.model[key]['subcamp'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['tercerpuesto'].toLowerCase() || app.model[key]['subcamp'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['cuartopuesto'].toLowerCase()) {
            ptos += 10;
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['tercerpuesto']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['tercerpuesto'].toLowerCase() == app.model[key]['tercerpuesto'].toLowerCase()) {
            ptos += 20;
          }
          else if (app.model[key]['tercerpuesto'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['subcamp'].toLowerCase() || app.model[key]['tercerpuesto'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['camp'].toLowerCase() || app.model[key]['tercerpuesto'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['cuartopuesto'].toLowerCase()) {
            ptos += 10;
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['cuartopuesto']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['cuartopuesto'].toLowerCase() == app.model[key]['cuartopuesto'].toLowerCase()) {
            ptos += 20;
          }
          else if (app.model[key]['cuartopuesto'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['subcamp'].toLowerCase() || app.model[key]['cuartopuesto'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['tercerpuesto'].toLowerCase() || app.model[key]['cuartopuesto'].toLowerCase() == app.model['-LE7QFSuDWcx4trbkLGQ']['camp'].toLowerCase()) {
            ptos += 10;
          }
          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          data.push(app.model[key]['gol']);
          if (app.model['-LE7QFSuDWcx4trbkLGQ']['gol'].toLowerCase().includes(app.model[key]['gol'].toLowerCase())) {
            ptos += 20;
          }

          data.splice(1,0,ptos);
        }
        if (!aux) {
          users.push(data);
        }
      }
      var columns = [
          { "title":"Participante" },
          { "title":"Puntos" },
          { "title":"Rusia "+app.model['-LE7QFSuDWcx4trbkLGQ']['a']['rus_ars']+" Arabia Saudita" },
          { "title":"Egipto "+app.model['-LE7QFSuDWcx4trbkLGQ']['a']['egi_uru']+" Uruguay" },
          { "title":"Marruecos "+app.model['-LE7QFSuDWcx4trbkLGQ']['b']['mar_ira']+" Irán" },
          { "title":"Portugal "+app.model['-LE7QFSuDWcx4trbkLGQ']['b']['por_esp']+" España" },
          { "title":"Francia "+app.model['-LE7QFSuDWcx4trbkLGQ']['c']['fra_aus']+" Australia" },
          { "title":"Argentina "+app.model['-LE7QFSuDWcx4trbkLGQ']['d']['arg_isl']+" Islandia" },
          { "title":"Perú "+app.model['-LE7QFSuDWcx4trbkLGQ']['c']['per_din']+" Dinamarca" },
          { "title":"Croacia "+app.model['-LE7QFSuDWcx4trbkLGQ']['d']['cro_nig']+" Nigeria" },
          { "title":"Costa Rica "+app.model['-LE7QFSuDWcx4trbkLGQ']['e']['cos_ser']+" Serbia" },
          { "title":"Alemania "+app.model['-LE7QFSuDWcx4trbkLGQ']['f']['ale_mex']+" México" },
          { "title":"Brasil "+app.model['-LE7QFSuDWcx4trbkLGQ']['e']['bra_sui']+" Suiza" },
          { "title":"Suecia "+app.model['-LE7QFSuDWcx4trbkLGQ']['f']['sue_cor']+" Corea del Sur" },
          { "title":"Bélgica "+app.model['-LE7QFSuDWcx4trbkLGQ']['g']['bel_pan']+" Panamá" },
          { "title":"Túnez "+app.model['-LE7QFSuDWcx4trbkLGQ']['g']['tun_ing']+" Inglaterra" },
          { "title":"Polonia "+app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_sen']+" Senegal" },
          { "title":"Colombia "+app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_sen']+" Japón" },
          { "title":"Rusia "+app.model['-LE7QFSuDWcx4trbkLGQ']['a']['rus_egi']+" Egipto" },
          { "title":"Portugal "+app.model['-LE7QFSuDWcx4trbkLGQ']['b']['por_mar']+" Marruecos" },
          { "title":"Uruguay "+app.model['-LE7QFSuDWcx4trbkLGQ']['a']['uru_ars']+" Arabia Saudita" },
          { "title":"Irán "+app.model['-LE7QFSuDWcx4trbkLGQ']['b']['ira_esp']+" España" },
          { "title":"Francia "+app.model['-LE7QFSuDWcx4trbkLGQ']['c']['fra_per']+" Perú" },
          { "title":"Dinamarca "+app.model['-LE7QFSuDWcx4trbkLGQ']['c']['din_aus']+" Australia" },
          { "title":"Argentina "+app.model['-LE7QFSuDWcx4trbkLGQ']['d']['arg_cro']+" Croacia" },
          { "title":"Brasil "+app.model['-LE7QFSuDWcx4trbkLGQ']['e']['bra_cos']+" Costa Rica" },
          { "title":"Nigeria "+app.model['-LE7QFSuDWcx4trbkLGQ']['d']['nig_isl']+" Islandia" },
          { "title":"Serbia "+app.model['-LE7QFSuDWcx4trbkLGQ']['e']['ser_sui']+" Suiza" },
          { "title":"Bélgica "+app.model['-LE7QFSuDWcx4trbkLGQ']['g']['bel_tun']+" Túnez" },
          { "title":"Alemania "+app.model['-LE7QFSuDWcx4trbkLGQ']['f']['ale_sue']+" Suecia" },
          { "title":"Corea del Sur "+app.model['-LE7QFSuDWcx4trbkLGQ']['f']['cor_mex']+" México" },
          { "title":"Inglaterra "+app.model['-LE7QFSuDWcx4trbkLGQ']['g']['ing_pan']+" Panamá" },
          { "title":"Japón "+app.model['-LE7QFSuDWcx4trbkLGQ']['h']['jap_sen']+" Senegal" },
          { "title":"Polonia "+app.model['-LE7QFSuDWcx4trbkLGQ']['h']['pol_col']+" Colombia" },
          { "title":"Arabia Saudita "+app.model['-LE7QFSuDWcx4trbkLGQ']['a']['ars_egi']+" Egipto" },
          { "title":"Uruguay "+app.model['-LE7QFSuDWcx4trbkLGQ']['a']['uru_rus']+" Rusia" },
          { "title":"España "+app.model['-LE7QFSuDWcx4trbkLGQ']['b']['esp_mar']+" Marruecos" },
          { "title":"Irán "+app.model['-LE7QFSuDWcx4trbkLGQ']['b']['ira_por']+" Portugal" },
          { "title":"Australia "+app.model['-LE7QFSuDWcx4trbkLGQ']['c']['aus_per']+" Perú" },
          { "title":"Dinamarca "+app.model['-LE7QFSuDWcx4trbkLGQ']['c']['din_fra']+" Francia" },
          { "title":"Islandia "+app.model['-LE7QFSuDWcx4trbkLGQ']['d']['isl_cro']+" Croacia" },
          { "title":"Nigeria "+app.model['-LE7QFSuDWcx4trbkLGQ']['d']['nig_arg']+" Argentina" },
          { "title":"México "+app.model['-LE7QFSuDWcx4trbkLGQ']['f']['mex_sue']+" Suecia" },
          { "title":"Corea del Sur "+app.model['-LE7QFSuDWcx4trbkLGQ']['f']['cor_ale']+" Alemania" },
          { "title":"Suiza "+app.model['-LE7QFSuDWcx4trbkLGQ']['e']['sui_cos']+" Costa Rica" },
          { "title":"Serbia "+app.model['-LE7QFSuDWcx4trbkLGQ']['e']['ser_bra']+" Brasil" },
          { "title":"Senegal "+app.model['-LE7QFSuDWcx4trbkLGQ']['h']['sen_col']+" Colombia" },
          { "title":"Japón "+app.model['-LE7QFSuDWcx4trbkLGQ']['h']['jap_pol']+" Polonia" },
          { "title":"Panamá "+app.model['-LE7QFSuDWcx4trbkLGQ']['g']['pan_tun']+" Túnez" },
          { "title":"Inglaterra "+app.model['-LE7QFSuDWcx4trbkLGQ']['g']['ing_bel']+" Bélgica" },
          { "title":"Campeón" },
          { "title":"Subcampeón" },
          { "title":"Tercero" },
          { "title":"Cuarto" },
          { "title":"Goleador" }
      ];
      if (app.firstentry) {
        $("#example1").DataTable({
              "data": users,
              "columns": columns,
              "paging":false,
              "scrollX": true,
              "columnDefs": [
                {"className": "dt-center", "targets": 0}
              ],
        });
        app.firstentry = 0;
      }
      else{
        $("#example1").DataTable().destroy();
        $("#example1").DataTable({
              "data": users,
              "columns": columns,
              "paging":false,
              "scrollX": true,
              "columnDefs": [
                {"className": "dt-center", "targets": 0}
              ],
        });
      }
    },

};

//document.getElementById('atras2').disabled = true;

firebase.initializeApp(app.firebaseConfig);
firebase.database().ref().on('value', function(snap){
  if (snap.val() !== null) {
    app.model = snap.val();
    //document.getElementById('atras2').disabled = false;
    //document.getElementById("posiciones").style.display = "inline";
    app.refreshUsers();
  }
});