<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name="newline">
<xsl:text>
</xsl:text>
</xsl:variable>

<xsl:template match="name">
</xsl:template>



<xsl:template match="EPIGRAPH">
<table><tr><td width="40%"/>
<td width="60%">
<div class="epigraph">
  <xsl:apply-templates/>
</div>
<div class="epigraph">
<xsl:if test="ATTRIBUTION/AUTHOR">
<xsl:apply-templates select="ATTRIBUTION/AUTHOR/text()"/>
</xsl:if>
<xsl:if test="ATTRIBUTION/TITLE">,
<em><xsl:apply-templates select="ATTRIBUTION/TITLE/text()"/></em>
</xsl:if>
<xsl:if test="ATTRIBUTION/DATE">
<xsl:call-template name="SPACE"/>
(<xsl:apply-templates select="ATTRIBUTION/DATE/text()"/>)
</xsl:if>
</div>
</td></tr></table>
</xsl:template>

<xsl:template match="SUBHEADING">
<H4><xsl:apply-templates select="NAME/node()"/></H4>
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="CITATION">
<xsl:if test="TEXT">
  <xsl:apply-templates select="TEXT/node()"/>
</xsl:if>
<xsl:if test="not(TEXT)">
  <xsl:apply-templates/>
</xsl:if>
</xsl:template>

<xsl:template match="BLOCKQUOTE">
<blockquote>
<xsl:apply-templates/>
</blockquote>
</xsl:template>

<xsl:template match="EMDASH">&#8212;</xsl:template>

<xsl:template match="ENDASH">&#8211;</xsl:template>

<xsl:template match="EM">
<em><xsl:apply-templates/></em>
</xsl:template>

<xsl:template match="TT">
<tt><xsl:apply-templates/></tt>
</xsl:template>

<xsl:template match="DATE"/>
<xsl:template match="TITLE"/>
<xsl:template match="AUTHOR"/>
<xsl:template match="INDEX"/>
<xsl:template match="CODEINDEX"/>
<xsl:template match="NAME"/>
<xsl:template match="EXCLUDE"/>
<xsl:template match="HISTORY"/>
<xsl:template match="SECTION"/>
<xsl:template match="SUBSECTION"/>
<xsl:template match="CAPTION"/>
<xsl:template match="COMMENT"/>
<xsl:template match="OMISSION"/>
<xsl:template match="EXAMPLE"/>

<xsl:template match="QUOTE"><xsl:if test="not(./ancestor::QUOTE)"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#147;<xsl:apply-templates/><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#148;</xsl:if><xsl:if test="./ancestor::QUOTE"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#145;<xsl:apply-templates/><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#146;</xsl:if></xsl:template>

<xsl:template match="TABLE"><TABLE><xsl:apply-templates/></TABLE></xsl:template>
<xsl:template match="TR"><TR><xsl:apply-templates/></TR></xsl:template>
<xsl:template match="TD"><TD><xsl:apply-templates/></TD></xsl:template>

<xsl:template match="APOS"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#146;</xsl:template>

<xsl:template name="SPACE"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>nbsp;</xsl:template>

<xsl:template match="SPACE"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>nbsp;</xsl:template>

<!-- word joiner character #8288  -->
<xsl:template match="WJ"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#8288;</xsl:template>

<xsl:template match="UUML_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>uuml;</xsl:template>
<xsl:template match="AACUTE_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>aacute;</xsl:template>
<xsl:template match="AACUTE_UPPER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>Aacute;</xsl:template>
<xsl:template match="AGRAVE_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>agrave;</xsl:template>
<xsl:template match="AGRAVE_HIGHER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>Agrave;</xsl:template>
<xsl:template match="ACIRC_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>acirc;</xsl:template>
<xsl:template match="EACUTE_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>eacute;</xsl:template>
<xsl:template match="EACUTE_UPPER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>Eacute;</xsl:template>
<xsl:template match="EGRAVE_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>egrave;</xsl:template>
<xsl:template match="EGRAVE_UPPER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>Egrave;</xsl:template>
<xsl:template match="ECIRC_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>ecirc;</xsl:template>
<xsl:template match="OUML_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>ouml;</xsl:template>
<xsl:template match="OUML_HIGHER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>Ouml;</xsl:template>
<xsl:template match="CCEDIL_LOWER"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>ccedil;</xsl:template>
<xsl:template match="ELLIPSIS"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>#8230;</xsl:template>
<xsl:template match="AMP"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>amp;</xsl:template>


<xsl:template match="BREAK">
<br/>
</xsl:template>

<xsl:template match="VERBATIM"><pre><xsl:apply-templates/></pre></xsl:template>

<xsl:template name="gt"><xsl:text disable-output-escaping="yes">&amp;</xsl:text>gt;</xsl:template>

<xsl:template match="B"><b><xsl:apply-templates/></b></xsl:template>

<xsl:template match="SC"><span style="font-variant: small-caps"><xsl:apply-templates/></span></xsl:template>

<xsl:template match="P"><p><xsl:apply-templates/></p></xsl:template>

<xsl:template match="OL">
  <xsl:variable name="exercise"><xsl:if test="ancestor::EXERCISE">exercise</xsl:if>
  </xsl:variable>
  <ol class="{$exercise}"><xsl:apply-templates/></ol>
</xsl:template>

<xsl:template match="UL"><ul><xsl:apply-templates/></ul></xsl:template>

<xsl:template match="LI"><li><xsl:apply-templates/></li></xsl:template>

<xsl:template match="DL"><dl><xsl:apply-templates/></dl></xsl:template>

<xsl:template match="DD"><dd><xsl:apply-templates/></dd></xsl:template>

<xsl:template match="DT"><dt><xsl:apply-templates/></dt></xsl:template>

<xsl:template match="H1"><h1><xsl:apply-templates/></h1></xsl:template>

<xsl:template match="H2"><h2><xsl:apply-templates/></h2></xsl:template>

<xsl:template match="H3"><h3><xsl:apply-templates/></h3></xsl:template>

<xsl:template match="PRE"><pre><xsl:apply-templates/></pre></xsl:template>

<xsl:template match="LINK"><a href="{@address}"><xsl:apply-templates/></a></xsl:template>

<xsl:template match="PAGE"><a class="link" onclick="window.displayManager.show('{@address}')"><xsl:apply-templates/></a></xsl:template>

</xsl:stylesheet>
